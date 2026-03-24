from rest_framework import serializers

from .models import Announcement, EmergencyAlert


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.email", read_only=True)

    class Meta:
        model = Announcement
        fields = "__all__"
        read_only_fields = ["id", "published_date", "created_by"]


class EmergencyAlertSerializer(serializers.ModelSerializer):
    sent_by_name = serializers.CharField(source="sent_by.email", read_only=True)

    class Meta:
        model = EmergencyAlert
        fields = "__all__"
        read_only_fields = ["id", "sent_date", "sent_by"]
