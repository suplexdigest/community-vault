from django.contrib import admin

from .models import MaintenanceCategory, WorkOrder, WorkOrderComment


@admin.register(MaintenanceCategory)
class MaintenanceCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "community"]
    list_filter = ["community"]


@admin.register(WorkOrder)
class WorkOrderAdmin(admin.ModelAdmin):
    list_display = ["title", "community", "property", "priority", "status", "requested_by", "created_at"]
    list_filter = ["status", "priority", "community"]
    search_fields = ["title", "description"]


@admin.register(WorkOrderComment)
class WorkOrderCommentAdmin(admin.ModelAdmin):
    list_display = ["work_order", "author", "is_internal", "created_at"]
    list_filter = ["is_internal"]
