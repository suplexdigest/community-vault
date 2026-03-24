from rest_framework import serializers

from .models import MaintenanceCategory, WorkOrder, WorkOrderComment


class MaintenanceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceCategory
        fields = "__all__"
        read_only_fields = ["id"]


class WorkOrderCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.email", read_only=True)

    class Meta:
        model = WorkOrderComment
        fields = "__all__"
        read_only_fields = ["id", "created_at", "author"]


class WorkOrderSerializer(serializers.ModelSerializer):
    property_unit = serializers.CharField(source="property.unit_number", read_only=True)
    property_address = serializers.CharField(source="property.address", read_only=True)
    requested_by_name = serializers.CharField(source="requested_by.email", read_only=True)
    assigned_vendor_name = serializers.CharField(source="assigned_vendor.name", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.email", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    comments = WorkOrderCommentSerializer(many=True, read_only=True)

    class Meta:
        model = WorkOrder
        fields = "__all__"
        read_only_fields = ["id", "created_at", "requested_by"]
