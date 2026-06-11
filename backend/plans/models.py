from django.conf import settings
from django.db import models


class FitnessPlan(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="fitness_plans"
    )
    content = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Plan for {self.user.email} at {self.created_at:%Y-%m-%d %H:%M}"
