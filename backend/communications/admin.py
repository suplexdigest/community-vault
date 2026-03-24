from django.contrib import admin

from .models import Announcement, EmergencyAlert


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ["title", "community", "priority", "target_audience", "is_pinned", "published_date"]
    list_filter = ["priority", "target_audience", "is_pinned", "community"]
    search_fields = ["title", "content"]


@admin.register(EmergencyAlert)
class EmergencyAlertAdmin(admin.ModelAdmin):
    list_display = ["title", "community", "alert_type", "is_active", "sent_date", "sent_by"]
    list_filter = ["alert_type", "is_active", "community"]
