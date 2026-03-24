from django.contrib import admin

from .models import Amenity, Reservation


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ["name", "community", "location", "capacity", "requires_reservation", "is_active"]
    list_filter = ["requires_reservation", "is_active", "community"]
    search_fields = ["name"]


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ["amenity", "community", "reserved_by", "start_datetime", "end_datetime", "status"]
    list_filter = ["status", "community"]
