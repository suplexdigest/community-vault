from django.contrib import admin

from .models import DocumentCategory, Document


@admin.register(DocumentCategory)
class DocumentCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "community", "sort_order"]
    list_filter = ["community"]


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ["title", "community", "document_type", "category", "is_public", "uploaded_by", "created_at"]
    list_filter = ["document_type", "is_public", "community"]
    search_fields = ["title", "description"]
