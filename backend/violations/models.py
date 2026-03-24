from django.conf import settings
from django.db import models

from core.models import Community
from properties.models import Property, Owner


class ViolationType(models.Model):
    CATEGORY_CHOICES = [
        ("property_maintenance", "Property Maintenance"),
        ("parking", "Parking"),
        ("noise", "Noise"),
        ("pets", "Pets"),
        ("architectural", "Architectural"),
        ("landscaping", "Landscaping"),
        ("trash", "Trash"),
        ("other", "Other"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="violation_types")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    default_fine = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default="other")
    cure_period_days = models.IntegerField(default=14)

    class Meta:
        ordering = ["category", "name"]
        unique_together = ["community", "name"]

    def __str__(self):
        return self.name


class Violation(models.Model):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("notice_sent", "Notice Sent"),
        ("cured", "Cured"),
        ("escalated", "Escalated"),
        ("fined", "Fined"),
        ("closed", "Closed"),
        ("appealed", "Appealed"),
    ]
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="violations")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="violations")
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reported_violations")
    violation_type = models.ForeignKey(ViolationType, on_delete=models.CASCADE, related_name="violations")
    description = models.TextField()
    photo = models.ImageField(upload_to="violations/", blank=True, null=True)
    date_observed = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_violations")
    cure_deadline = models.DateField(null=True, blank=True)
    cured_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.violation_type.name} - {self.property.unit_number}"


class ViolationNotice(models.Model):
    NOTICE_TYPE_CHOICES = [
        ("first_warning", "First Warning"),
        ("second_warning", "Second Warning"),
        ("final_notice", "Final Notice"),
        ("fine_notice", "Fine Notice"),
        ("hearing_notice", "Hearing Notice"),
    ]
    SENT_VIA_CHOICES = [
        ("email", "Email"),
        ("mail", "Mail"),
        ("both", "Both"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="violation_notices")
    violation = models.ForeignKey(Violation, on_delete=models.CASCADE, related_name="notices")
    notice_type = models.CharField(max_length=20, choices=NOTICE_TYPE_CHOICES)
    sent_date = models.DateField()
    sent_via = models.CharField(max_length=10, choices=SENT_VIA_CHOICES, default="email")
    content = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_notices")

    class Meta:
        ordering = ["-sent_date"]

    def __str__(self):
        return f"{self.notice_type} - {self.violation}"


class Fine(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("partial", "Partial"),
        ("waived", "Waived"),
        ("appealed", "Appealed"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="fines")
    violation = models.ForeignKey(Violation, on_delete=models.CASCADE, related_name="fines")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    issued_date = models.DateField()
    due_date = models.DateField()
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-issued_date"]

    def __str__(self):
        return f"Fine ${self.amount} - {self.violation}"


class Appeal(models.Model):
    DECISION_CHOICES = [
        ("pending", "Pending"),
        ("upheld", "Upheld"),
        ("overturned", "Overturned"),
        ("modified", "Modified"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="appeals")
    violation = models.ForeignKey(Violation, on_delete=models.CASCADE, related_name="appeals")
    filed_by = models.ForeignKey(Owner, on_delete=models.CASCADE, related_name="appeals")
    filed_date = models.DateField()
    reason = models.TextField()
    hearing_date = models.DateField(null=True, blank=True)
    decision = models.CharField(max_length=20, choices=DECISION_CHOICES, default="pending")
    decision_notes = models.TextField(blank=True, default="")
    decided_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="appeal_decisions")
    decided_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-filed_date"]

    def __str__(self):
        return f"Appeal by {self.filed_by} - {self.violation}"
