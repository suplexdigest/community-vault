from django.contrib import admin

from .models import ViolationType, Violation, ViolationNotice, Fine, Appeal


@admin.register(ViolationType)
class ViolationTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "community", "category", "default_fine", "cure_period_days"]
    list_filter = ["category", "community"]


@admin.register(Violation)
class ViolationAdmin(admin.ModelAdmin):
    list_display = ["violation_type", "property", "community", "status", "priority", "date_observed", "created_at"]
    list_filter = ["status", "priority", "community"]
    search_fields = ["description", "property__unit_number"]


@admin.register(ViolationNotice)
class ViolationNoticeAdmin(admin.ModelAdmin):
    list_display = ["violation", "notice_type", "sent_date", "sent_via"]
    list_filter = ["notice_type", "sent_via"]


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ["violation", "community", "amount", "issued_date", "due_date", "status"]
    list_filter = ["status", "community"]


@admin.register(Appeal)
class AppealAdmin(admin.ModelAdmin):
    list_display = ["violation", "filed_by", "filed_date", "decision", "decided_date"]
    list_filter = ["decision", "community"]
