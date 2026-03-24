from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Community, Role, CommunitySettings


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "username", "first_name", "last_name", "is_verified", "is_staff"]
    search_fields = ["email", "username", "first_name", "last_name"]
    ordering = ["-date_joined"]


@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ["name", "city", "state", "plan", "total_units", "is_active", "created_at"]
    list_filter = ["plan", "state", "is_active"]
    search_fields = ["name", "city"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ["user", "community", "role"]
    list_filter = ["role"]
    search_fields = ["user__email", "community__name"]


@admin.register(CommunitySettings)
class CommunitySettingsAdmin(admin.ModelAdmin):
    list_display = ["community", "late_fee_amount", "grace_period_days", "auto_late_fees"]
