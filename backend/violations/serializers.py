from rest_framework import serializers

from .models import ViolationType, Violation, ViolationNotice, Fine, Appeal


class ViolationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViolationType
        fields = "__all__"
        read_only_fields = ["id"]


class ViolationSerializer(serializers.ModelSerializer):
    violation_type_name = serializers.CharField(source="violation_type.name", read_only=True)
    property_unit = serializers.CharField(source="property.unit_number", read_only=True)
    property_address = serializers.CharField(source="property.address", read_only=True)
    reported_by_name = serializers.CharField(source="reported_by.email", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.email", read_only=True)

    class Meta:
        model = Violation
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class ViolationNoticeSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.email", read_only=True)

    class Meta:
        model = ViolationNotice
        fields = "__all__"
        read_only_fields = ["id"]


class FineSerializer(serializers.ModelSerializer):
    violation_description = serializers.CharField(source="violation.description", read_only=True)

    class Meta:
        model = Fine
        fields = "__all__"
        read_only_fields = ["id"]


class AppealSerializer(serializers.ModelSerializer):
    filed_by_name = serializers.SerializerMethodField()
    decided_by_name = serializers.CharField(source="decided_by.email", read_only=True)

    class Meta:
        model = Appeal
        fields = "__all__"
        read_only_fields = ["id"]

    def get_filed_by_name(self, obj):
        return f"{obj.filed_by.first_name} {obj.filed_by.last_name}"
