from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, default="")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=64, blank=True, default="")
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        ordering = ["-date_joined"]

    def __str__(self):
        return self.email


class Community(models.Model):
    PLAN_CHOICES = [
        ("free", "Free"),
        ("starter", "Starter"),
        ("pro", "Pro"),
        ("enterprise", "Enterprise"),
    ]

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=100)
    address = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    state = models.CharField(max_length=2, blank=True, default="")
    zip_code = models.CharField(max_length=10, blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    website = models.URLField(blank=True, default="")
    logo = models.ImageField(upload_to="community_logos/", blank=True, null=True)
    timezone = models.CharField(max_length=50, default="America/New_York")
    management_company = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="managed_communities"
    )
    total_units = models.IntegerField(default=0)
    monthly_assessment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fiscal_year_start = models.IntegerField(default=1, help_text="Month 1-12")
    features = models.JSONField(default=list, blank=True)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default="free")
    stripe_customer_id = models.CharField(max_length=100, blank=True, default="")
    stripe_subscription_id = models.CharField(max_length=100, blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "communities"

    def __str__(self):
        return self.name


class Role(models.Model):
    ROLE_CHOICES = [
        ("resident", "Resident"),
        ("board_member", "Board Member"),
        ("treasurer", "Treasurer"),
        ("secretary", "Secretary"),
        ("president", "President"),
        ("manager", "Manager"),
        ("admin", "Admin"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="roles")
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="roles")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="resident")

    class Meta:
        ordering = ["community", "user"]
        unique_together = ["user", "community"]

    def __str__(self):
        return f"{self.user.email} - {self.community.name} ({self.role})"


class CommunitySettings(models.Model):
    community = models.OneToOneField(Community, on_delete=models.CASCADE, related_name="settings")
    late_fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    grace_period_days = models.IntegerField(default=15)
    violation_fine_default = models.DecimalField(max_digits=10, decimal_places=2, default=50)
    auto_late_fees = models.BooleanField(default=False)
    require_architectural_approval = models.BooleanField(default=True)
    fiscal_year_start_month = models.IntegerField(default=1)

    class Meta:
        verbose_name_plural = "community settings"

    def __str__(self):
        return f"Settings for {self.community.name}"
