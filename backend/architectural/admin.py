from django.contrib import admin

from .models import ARBRequest, ARBComment


@admin.register(ARBRequest)
class ARBRequestAdmin(admin.ModelAdmin):
    list_display = ["title", "community", "property", "owner", "project_type", "status", "created_at"]
    list_filter = ["status", "project_type", "community"]
    search_fields = ["title", "description"]


@admin.register(ARBComment)
class ARBCommentAdmin(admin.ModelAdmin):
    list_display = ["request", "author", "is_internal", "created_at"]
    list_filter = ["is_internal"]
