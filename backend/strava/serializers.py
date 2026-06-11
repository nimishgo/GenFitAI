from rest_framework import serializers
from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = (
            "id",
            "strava_id",
            "name",
            "sport_type",
            "distance",
            "elapsed_time",
            "start_date",
            "average_heartrate",
            "total_elevation_gain",
        )
