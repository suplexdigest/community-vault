from django.contrib import admin

from .models import Assessment, Payment, Vendor, BudgetCategory, Budget, Expense, ReserveFund


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ["owner", "property", "community", "assessment_type", "amount", "due_date", "status"]
    list_filter = ["status", "assessment_type", "community"]
    search_fields = ["owner__first_name", "owner__last_name"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["owner", "community", "amount", "payment_method", "payment_date"]
    list_filter = ["payment_method", "community"]


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ["name", "community", "specialty", "phone", "is_active"]
    list_filter = ["is_active", "community"]
    search_fields = ["name", "contact_name"]


@admin.register(BudgetCategory)
class BudgetCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "community", "category_type", "sort_order"]
    list_filter = ["category_type", "community"]


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ["fiscal_year", "category", "community", "budgeted_amount", "actual_amount"]
    list_filter = ["fiscal_year", "community"]


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ["description", "community", "vendor", "amount", "expense_date", "status"]
    list_filter = ["status", "community"]
    search_fields = ["description"]


@admin.register(ReserveFund)
class ReserveFundAdmin(admin.ModelAdmin):
    list_display = ["name", "community", "target_amount", "current_balance"]
