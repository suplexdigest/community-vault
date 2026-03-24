from django.db import models
from django.conf import settings
from core.models import Community


class NotificationPreference(models.Model):
    """Per-user notification preferences for a community."""
    CHANNEL_CHOICES = [
        ("email", "Email"),
        ("sms", "SMS"),
        ("both", "Email & SMS"),
        ("none", "None"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="notification_preferences")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_preferences")

    # Channel preferences per notification type
    assessment_reminders = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default="email")
    overdue_notices = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default="both")
    violation_notices = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default="email")
    work_order_updates = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default="email")
    meeting_reminders = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default="email")
    arb_updates = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default="email")
    announcements = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default="email")
    emergency_alerts = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default="both")

    class Meta:
        unique_together = ["community", "user"]
        ordering = ["user__last_name"]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.community.name}"


class NotificationLog(models.Model):
    """Log of all sent notifications for audit trail."""
    CHANNEL_CHOICES = [
        ("email", "Email"),
        ("sms", "SMS"),
    ]
    STATUS_CHOICES = [
        ("sent", "Sent"),
        ("failed", "Failed"),
        ("queued", "Queued"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="notification_logs")
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="notification_logs")
    recipient_email = models.EmailField(blank=True, default="")
    recipient_phone = models.CharField(max_length=20, blank=True, default="")
    channel = models.CharField(max_length=10, choices=CHANNEL_CHOICES)
    notification_type = models.CharField(max_length=50)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="queued")
    error_message = models.TextField(blank=True, default="")
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-sent_at"]

    def __str__(self):
        return f"{self.notification_type} → {self.recipient_email or self.recipient_phone} ({self.status})"


class ReminderSchedule(models.Model):
    """Configurable reminder schedules per community."""
    community = models.OneToOneField(Community, on_delete=models.CASCADE, related_name="reminder_schedule")

    # Assessment reminders
    assessment_reminder_days_before = models.IntegerField(default=7, help_text="Days before due date to send reminder")
    assessment_second_reminder_days = models.IntegerField(default=3, help_text="Days before due date for second reminder")
    overdue_reminder_frequency_days = models.IntegerField(default=7, help_text="How often to remind about overdue assessments")

    # Meeting reminders
    meeting_reminder_days_before = models.IntegerField(default=3, help_text="Days before meeting to send reminder")
    meeting_reminder_hours_before = models.IntegerField(default=2, help_text="Hours before meeting for day-of reminder")

    # Violation cure deadlines
    violation_cure_reminder_days_before = models.IntegerField(default=3, help_text="Days before cure deadline to remind")

    # Work order follow-ups
    work_order_stale_days = models.IntegerField(default=14, help_text="Days before flagging a work order as stale")

    class Meta:
        ordering = ["community__name"]

    def __str__(self):
        return f"Reminders for {self.community.name}"
