from django.conf import settings
from django.db import models


class StravaProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="stravaprofile"
    )
    athlete_id = models.BigIntegerField(unique=True)
    access_token = models.CharField(max_length=255)
    refresh_token = models.CharField(max_length=255)
    token_expires_at = models.BigIntegerField(default=0)
    athlete_name = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.user.email} — Strava #{self.athlete_id}"


class Activity(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activities"
    )
    strava_id = models.BigIntegerField(unique=True)
    name = models.CharField(max_length=255)
    sport_type = models.CharField(max_length=100)
    distance = models.FloatField(default=0)
    elapsed_time = models.IntegerField(default=0)
    start_date = models.DateTimeField()
    average_heartrate = models.FloatField(null=True, blank=True)
    total_elevation_gain = models.FloatField(default=0)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.name} ({self.sport_type}) — {self.user.email}"
