from django.urls import path
from . import views

urlpatterns = [
    path("connect/", views.strava_connect, name="strava_connect"),
    path("callback/", views.strava_callback, name="strava_callback"),
    path("sync/", views.sync_activities, name="strava_sync"),
    path("activities/", views.list_activities, name="activities"),
]
