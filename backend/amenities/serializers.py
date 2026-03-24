from rest_framework import serializers

from .models import Amenity, Reservation


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = "__all__"
        read_only_fields = ["id"]


class ReservationSerializer(serializers.ModelSerializer):
    amenity_name = serializers.CharField(source="amenity.name", read_only=True)
    reserved_by_name = serializers.CharField(source="reserved_by.email", read_only=True)
    property_unit = serializers.CharField(source="property.unit_number", read_only=True)

    class Meta:
        model = Reservation
        fields = "__all__"
        read_only_fields = ["id", "created_at", "reserved_by"]
