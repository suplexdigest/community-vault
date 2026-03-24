from rest_framework import serializers

from .models import Property, Owner, Resident, ParkingSpot


class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class PropertyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ["id", "unit_number", "address", "property_type", "is_occupied"]


class OwnerSerializer(serializers.ModelSerializer):
    property_address = serializers.CharField(source="property.address", read_only=True)
    property_unit = serializers.CharField(source="property.unit_number", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Owner
        fields = "__all__"
        read_only_fields = ["id"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class ResidentSerializer(serializers.ModelSerializer):
    property_address = serializers.CharField(source="property.address", read_only=True)
    property_unit = serializers.CharField(source="property.unit_number", read_only=True)

    class Meta:
        model = Resident
        fields = "__all__"
        read_only_fields = ["id"]


class ParkingSpotSerializer(serializers.ModelSerializer):
    property_unit = serializers.CharField(source="property.unit_number", read_only=True)

    class Meta:
        model = ParkingSpot
        fields = "__all__"
        read_only_fields = ["id"]
