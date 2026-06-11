from django.contrib import admin
from .models import Activity, StravaProfile


@admin.register(StravaProfile)
class StravaProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "athlete_id", "athlete_name")


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ("name", "sport_type", "user", "start_date", "distance")
    list_filter = ("sport_type",)
