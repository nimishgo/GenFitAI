import time
import requests
from django.conf import settings
from django.http import HttpResponseRedirect
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Activity, StravaProfile
from .serializers import ActivitySerializer

STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize"
STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
STRAVA_API_BASE = "https://www.strava.com/api/v3"


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def strava_connect(request):
    """Return the Strava OAuth authorization URL."""
    params = {
        "client_id": settings.STRAVA_CLIENT_ID,
        "redirect_uri": settings.STRAVA_REDIRECT_URI,
        "response_type": "code",
        "approval_prompt": "auto",
        "scope": "activity:read_all",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return Response({"auth_url": f"{STRAVA_AUTH_URL}?{query}"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def strava_callback(request):
    """Exchange OAuth code for tokens, store profile, sync activities."""
    code = request.query_params.get("code")
    error = request.query_params.get("error")

    if error or not code:
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/dashboard?strava_error=access_denied"
        )

    token_resp = requests.post(
        STRAVA_TOKEN_URL,
        data={
            "client_id": settings.STRAVA_CLIENT_ID,
            "client_secret": settings.STRAVA_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
        },
        timeout=10,
    )

    if token_resp.status_code != 200:
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/dashboard?strava_error=token_exchange_failed"
        )

    data = token_resp.json()
    athlete = data.get("athlete", {})

    profile, _ = StravaProfile.objects.update_or_create(
        user=request.user,
        defaults={
            "athlete_id": athlete.get("id"),
            "access_token": data["access_token"],
            "refresh_token": data["refresh_token"],
            "token_expires_at": data["expires_at"],
            "athlete_name": f"{athlete.get('firstname', '')} {athlete.get('lastname', '')}".strip(),
        },
    )

    _sync_activities(request.user, profile)

    return HttpResponseRedirect(f"{settings.FRONTEND_URL}/dashboard?strava_connected=true")


def _get_valid_token(profile: StravaProfile) -> str:
    """Refresh access token if expired."""
    if time.time() < profile.token_expires_at - 60:
        return profile.access_token

    resp = requests.post(
        STRAVA_TOKEN_URL,
        data={
            "client_id": settings.STRAVA_CLIENT_ID,
            "client_secret": settings.STRAVA_CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": profile.refresh_token,
        },
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    profile.access_token = data["access_token"]
    profile.refresh_token = data["refresh_token"]
    profile.token_expires_at = data["expires_at"]
    profile.save()
    return profile.access_token


def _sync_activities(user, profile: StravaProfile, per_page: int = 30):
    """Fetch latest activities from Strava and upsert into DB."""
    token = _get_valid_token(profile)
    resp = requests.get(
        f"{STRAVA_API_BASE}/athlete/activities",
        headers={"Authorization": f"Bearer {token}"},
        params={"per_page": per_page, "page": 1},
        timeout=15,
    )
    resp.raise_for_status()

    for item in resp.json():
        Activity.objects.update_or_create(
            strava_id=item["id"],
            defaults={
                "user": user,
                "name": item.get("name", ""),
                "sport_type": item.get("sport_type", item.get("type", "")),
                "distance": item.get("distance", 0),
                "elapsed_time": item.get("elapsed_time", 0),
                "start_date": item.get("start_date"),
                "average_heartrate": item.get("average_heartrate"),
                "total_elevation_gain": item.get("total_elevation_gain", 0),
            },
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def sync_activities(request):
    """Manually trigger activity sync."""
    try:
        profile = request.user.stravaprofile
    except StravaProfile.DoesNotExist:
        return Response(
            {"error": "Strava not connected"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        _sync_activities(request.user, profile)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

    return Response({"status": "synced"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_activities(request):
    activities = Activity.objects.filter(user=request.user)[:20]
    return Response(ActivitySerializer(activities, many=True).data)
