from django.conf import settings
from django.db import models

from core.models import Community
from properties.models import Property
from finances.models import Vendor


class MaintenanceCategory(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="maintenance_categories")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["name"]
        unique_together = ["community", "name"]
        verbose_name_plural = "maintenance categories"

    def __str__(self):
        return self.name


class WorkOrder(models.Model):
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("emergency", "Emergency"),
    ]
    STATUS_CHOICES = [
        ("submitted", "Submitted"),
        ("acknowledged", "Acknowledged"),
        ("in_progress", "In Progress"),
        ("on_hold", "On Hold"),
        ("completed", "Completed"),
        ("closed", "Closed"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="work_orders")
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True, related_name="work_orders", help_text="Null for common area requests")
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="requested_work_orders")
    category = models.ForeignKey(MaintenanceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="work_orders")
    title = models.CharField(max_length=255)
    description = models.TextField()
    photo = models.ImageField(upload_to="work_orders/", blank=True, null=True)
    priority = models.CharField(max_length=15, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    assigned_vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name="work_orders")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_work_orders")
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    scheduled_date = models.DateField(null=True, blank=True)
    completed_date = models.DateField(null=True, blank=True)
    resident_notes = models.TextField(blank=True, default="")
    staff_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"WO-{self.id}: {self.title}"


class WorkOrderComment(models.Model):
    work_order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="work_order_comments")
    content = models.TextField()
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Comment on WO-{self.work_order_id} by {self.author.email}"
