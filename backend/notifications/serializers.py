from rest_framework import serializers
from .models import NotificationPreference, NotificationLog, ReminderSchedule


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            "id", "assessment_reminders", "overdue_notices", "violation_notices",
            "work_order_updates", "meeting_reminders", "arb_updates",
            "announcements", "emergency_alerts",
        ]


class NotificationLogSerializer(serializers.ModelSerializer):
    recipient_name = serializers.SerializerMethodField()

    class Meta:
        model = NotificationLog
        fields = [
            "id", "recipient_name", "recipient_email", "recipient_phone",
            "channel", "notification_type", "subject", "body",
            "status", "error_message", "sent_at",
        ]

    def get_recipient_name(self, obj):
        return obj.recipient.get_full_name() if obj.recipient else ""


class ReminderScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReminderSchedule
        fields = [
            "id", "assessment_reminder_days_before", "assessment_second_reminder_days",
            "overdue_reminder_frequency_days", "meeting_reminder_days_before",
            "meeting_reminder_hours_before", "violation_cure_reminder_days_before",
            "work_order_stale_days",
        ]
