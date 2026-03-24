from django.conf import settings
from django.db import models

from core.models import Community


class Announcement(models.Model):
    PRIORITY_CHOICES = [
        ("normal", "Normal"),
        ("important", "Important"),
        ("urgent", "Urgent"),
    ]
    AUDIENCE_CHOICES = [
        ("all", "All"),
        ("owners", "Owners"),
        ("residents", "Residents"),
        ("board", "Board"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="announcements")
    title = models.CharField(max_length=255)
    content = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="normal")
    target_audience = models.CharField(max_length=10, choices=AUDIENCE_CHOICES, default="all")
    is_pinned = models.BooleanField(default=False)
    published_date = models.DateTimeField(auto_now_add=True)
    expires_date = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="announcements")

    class Meta:
        ordering = ["-is_pinned", "-published_date"]

    def __str__(self):
        return self.title


class EmergencyAlert(models.Model):
    ALERT_TYPE_CHOICES = [
        ("water", "Water"),
        ("fire", "Fire"),
        ("security", "Security"),
        ("weather", "Weather"),
        ("other", "Other"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="emergency_alerts")
    title = models.CharField(max_length=255)
    message = models.TextField()
    alert_type = models.CharField(max_length=10, choices=ALERT_TYPE_CHOICES, default="other")
    sent_date = models.DateTimeField(auto_now_add=True)
    sent_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="sent_alerts")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-sent_date"]

    def __str__(self):
        return f"[{self.alert_type.upper()}] {self.title}"
