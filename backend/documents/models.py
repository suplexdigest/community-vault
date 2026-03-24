from django.conf import settings
from django.db import models

from core.models import Community


class DocumentCategory(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="document_categories")
    name = models.CharField(max_length=100)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        unique_together = ["community", "name"]
        verbose_name_plural = "document categories"

    def __str__(self):
        return self.name


class Document(models.Model):
    TYPE_CHOICES = [
        ("ccr", "CC&Rs"),
        ("bylaws", "Bylaws"),
        ("rules", "Rules & Regulations"),
        ("form", "Form"),
        ("financial", "Financial"),
        ("minutes", "Minutes"),
        ("other", "Other"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="documents")
    category = models.ForeignKey(DocumentCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="documents")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    file = models.FileField(upload_to="documents/")
    document_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="other")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="uploaded_documents")
    is_public = models.BooleanField(default=True, help_text="Visible to all residents")
    version = models.CharField(max_length=20, blank=True, default="1.0")
    supersedes = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="superseded_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
