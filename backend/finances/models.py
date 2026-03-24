from django.conf import settings
from django.db import models

from core.models import Community
from properties.models import Property, Owner


class Assessment(models.Model):
    TYPE_CHOICES = [
        ("regular", "Regular"),
        ("special", "Special"),
        ("late_fee", "Late Fee"),
        ("fine", "Fine"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("partial", "Partial"),
        ("overdue", "Overdue"),
        ("waived", "Waived"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="assessments")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="assessments")
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE, related_name="assessments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    assessment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="regular")
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-due_date"]

    def __str__(self):
        return f"{self.owner} - {self.assessment_type} - ${self.amount}"


class Payment(models.Model):
    METHOD_CHOICES = [
        ("check", "Check"),
        ("ach", "ACH"),
        ("credit_card", "Credit Card"),
        ("cash", "Cash"),
        ("online", "Online"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="payments")
    assessment = models.ForeignKey(Assessment, on_delete=models.SET_NULL, null=True, blank=True, related_name="payments")
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default="check")
    check_number = models.CharField(max_length=50, blank=True, default="")
    transaction_id = models.CharField(max_length=100, blank=True, default="")
    payment_date = models.DateField()
    notes = models.TextField(blank=True, default="")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="recorded_payments")

    class Meta:
        ordering = ["-payment_date"]

    def __str__(self):
        return f"{self.owner} - ${self.amount} on {self.payment_date}"


class Vendor(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="vendors")
    name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=200, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    address = models.CharField(max_length=255, blank=True, default="")
    specialty = models.CharField(max_length=100, blank=True, default="")
    license_number = models.CharField(max_length=100, blank=True, default="")
    insurance_expiry = models.DateField(null=True, blank=True)
    w9_on_file = models.BooleanField(default=False)
    notes = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class BudgetCategory(models.Model):
    TYPE_CHOICES = [
        ("income", "Income"),
        ("expense", "Expense"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="budget_categories")
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        unique_together = ["community", "name"]
        verbose_name_plural = "budget categories"

    def __str__(self):
        return self.name


class Budget(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="budgets")
    fiscal_year = models.IntegerField()
    category = models.ForeignKey(BudgetCategory, on_delete=models.CASCADE, related_name="budgets")
    budgeted_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    actual_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["fiscal_year", "category__sort_order"]
        unique_together = ["community", "fiscal_year", "category"]

    def __str__(self):
        return f"{self.fiscal_year} - {self.category.name}"


class Expense(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("paid", "Paid"),
        ("rejected", "Rejected"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="expenses")
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name="expenses")
    category = models.ForeignKey(BudgetCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="expenses")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=500)
    expense_date = models.DateField()
    check_number = models.CharField(max_length=50, blank=True, default="")
    receipt = models.FileField(upload_to="receipts/", blank=True, null=True)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_expenses")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-expense_date"]

    def __str__(self):
        return f"{self.description} - ${self.amount}"


class ReserveFund(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="reserve_funds")
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    description = models.TextField(blank=True, default="")
    last_study_date = models.DateField(null=True, blank=True)
    next_study_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} - ${self.current_balance}"
