import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from google.genai.errors import ServerError

from strava.models import Activity
from strava.serializers import ActivitySerializer
from .gemini import generate_fitness_plan
from .models import FitnessPlan
from .serializers import FitnessPlanSerializer

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_plan(request):
    activities = Activity.objects.filter(user=request.user)[:10]
    activity_data = ActivitySerializer(activities, many=True).data

    try:
        plan_content = generate_fitness_plan(request.user, list(activity_data))
    except ServerError as exc:
        logger.warning("Gemini unavailable: %s", exc)
        return Response(
            {"error": "The AI service is temporarily busy. Please try again in a moment."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as exc:
        logger.exception("Plan generation failed")
        return Response(
            {"error": f"Failed to generate plan: {exc}"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    plan = FitnessPlan.objects.create(user=request.user, content=plan_content)
    return Response(FitnessPlanSerializer(plan).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_plans(request):
    plans = FitnessPlan.objects.filter(user=request.user)[:5]
    return Response(FitnessPlanSerializer(plans, many=True).data)
