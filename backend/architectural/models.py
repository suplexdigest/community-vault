from django.conf import settings
from django.db import models

from core.models import Community
from properties.models import Property, Owner


class ARBRequest(models.Model):
    PROJECT_TYPE_CHOICES = [
        ("exterior_paint", "Exterior Paint"),
        ("fence", "Fence"),
        ("landscaping", "Landscaping"),
        ("structure", "Structure"),
        ("roof", "Roof"),
        ("solar", "Solar"),
        ("window", "Window"),
        ("door", "Door"),
        ("other", "Other"),
    ]
    STATUS_CHOICES = [
        ("submitted", "Submitted"),
        ("under_review", "Under Review"),
        ("approved", "Approved"),
        ("approved_with_conditions", "Approved with Conditions"),
        ("denied", "Denied"),
        ("withdrawn", "Withdrawn"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="arb_requests")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="arb_requests")
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE, related_name="arb_requests")
    title = models.CharField(max_length=255)
    description = models.TextField()
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES, default="other")
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_start_date = models.DateField(null=True, blank=True)
    estimated_completion_date = models.DateField(null=True, blank=True)
    plans_file = models.FileField(upload_to="arb_plans/", blank=True, null=True)
    photo = models.ImageField(upload_to="arb_photos/", blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="submitted")
    conditions = models.TextField(blank=True, default="")
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_arb_requests")
    review_date = models.DateField(null=True, blank=True)
    review_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "ARB Request"

    def __str__(self):
        return f"{self.title} - {self.property.unit_number}"


class ARBComment(models.Model):
    request = models.ForeignKey(ARBRequest, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="arb_comments")
    content = models.TextField()
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "ARB Comment"

    def __str__(self):
        return f"Comment on {self.request.title} by {self.author.email}"
