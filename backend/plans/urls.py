from django.urls import path
from . import views

urlpatterns = [
    path("plans/generate/", views.generate_plan, name="generate_plan"),
    path("plans/", views.list_plans, name="list_plans"),
]
