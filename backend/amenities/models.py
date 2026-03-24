from django.conf import settings
from django.db import models

from core.models import Community
from properties.models import Property


class Amenity(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="amenities")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    location = models.CharField(max_length=255, blank=True, default="")
    capacity = models.IntegerField(null=True, blank=True)
    requires_reservation = models.BooleanField(default=True)
    reservation_max_hours = models.IntegerField(default=4)
    reservation_advance_days = models.IntegerField(default=30)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rules = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "amenities"

    def __str__(self):
        return self.name


class Reservation(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("denied", "Denied"),
        ("cancelled", "Cancelled"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="reservations")
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE, related_name="reservations")
    reserved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reservations")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="reservations")
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    guest_count = models.IntegerField(default=0)
    purpose = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    deposit_paid = models.BooleanField(default=False)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_datetime"]

    def __str__(self):
        return f"{self.amenity.name} - {self.reserved_by.email} ({self.start_datetime})"
