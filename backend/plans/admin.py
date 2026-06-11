from django.contrib import admin
from .models import FitnessPlan


@admin.register(FitnessPlan)
class FitnessPlanAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at")
    list_filter = ("user",)
