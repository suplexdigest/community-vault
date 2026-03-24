from django.conf import settings
from django.db import models

from core.models import Community


class Property(models.Model):
    PROPERTY_TYPE_CHOICES = [
        ("single_family", "Single Family"),
        ("townhouse", "Townhouse"),
        ("condo", "Condo"),
        ("lot", "Lot"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="properties")
    unit_number = models.CharField(max_length=50)
    address = models.CharField(max_length=255, blank=True, default="")
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES, default="single_family")
    square_footage = models.IntegerField(null=True, blank=True)
    bedrooms = models.IntegerField(null=True, blank=True)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    year_built = models.IntegerField(null=True, blank=True)
    lot_size = models.CharField(max_length=50, blank=True, default="")
    parking_spots = models.IntegerField(default=0)
    has_garage = models.BooleanField(default=False)
    notes = models.TextField(blank=True, default="")
    is_occupied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["unit_number"]
        unique_together = ["community", "unit_number"]
        verbose_name_plural = "properties"

    def __str__(self):
        return f"{self.unit_number} - {self.address}"


class Owner(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="owners")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="owners")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="ownerships")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    mailing_address = models.CharField(max_length=255, blank=True, default="", help_text="If different from property address")
    is_primary = models.BooleanField(default=True)
    ownership_start_date = models.DateField(null=True, blank=True)
    ownership_end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=True)
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Resident(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="residents")
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="residents")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    is_owner = models.BooleanField(default=False)
    move_in_date = models.DateField(null=True, blank=True)
    move_out_date = models.DateField(null=True, blank=True)
    emergency_contact_name = models.CharField(max_length=200, blank=True, default="")
    emergency_contact_phone = models.CharField(max_length=20, blank=True, default="")
    vehicle_make = models.CharField(max_length=50, blank=True, default="")
    vehicle_model = models.CharField(max_length=50, blank=True, default="")
    vehicle_color = models.CharField(max_length=30, blank=True, default="")
    license_plate = models.CharField(max_length=20, blank=True, default="")
    pet_type = models.CharField(max_length=50, blank=True, default="")
    pet_breed = models.CharField(max_length=50, blank=True, default="")
    pet_name = models.CharField(max_length=50, blank=True, default="")
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class ParkingSpot(models.Model):
    SPOT_TYPE_CHOICES = [
        ("standard", "Standard"),
        ("handicap", "Handicap"),
        ("reserved", "Reserved"),
        ("guest", "Guest"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="parking_spots")
    spot_number = models.CharField(max_length=20)
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_parking_spots")
    location = models.CharField(max_length=100, blank=True, default="")
    spot_type = models.CharField(max_length=20, choices=SPOT_TYPE_CHOICES, default="standard")
    is_assigned = models.BooleanField(default=False)

    class Meta:
        ordering = ["spot_number"]
        unique_together = ["community", "spot_number"]

    def __str__(self):
        return f"Spot {self.spot_number}"
