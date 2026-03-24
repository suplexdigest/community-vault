from django.contrib import admin

from .models import Property, Owner, Resident, ParkingSpot


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ["unit_number", "address", "community", "property_type", "is_occupied"]
    list_filter = ["property_type", "is_occupied", "community"]
    search_fields = ["unit_number", "address"]


@admin.register(Owner)
class OwnerAdmin(admin.ModelAdmin):
    list_display = ["first_name", "last_name", "property", "community", "is_current", "is_primary"]
    list_filter = ["is_current", "is_primary", "community"]
    search_fields = ["first_name", "last_name", "email"]


@admin.register(Resident)
class ResidentAdmin(admin.ModelAdmin):
    list_display = ["first_name", "last_name", "property", "community", "is_owner", "move_in_date"]
    list_filter = ["is_owner", "community"]
    search_fields = ["first_name", "last_name", "email"]


@admin.register(ParkingSpot)
class ParkingSpotAdmin(admin.ModelAdmin):
    list_display = ["spot_number", "community", "spot_type", "is_assigned", "property"]
    list_filter = ["spot_type", "is_assigned", "community"]
