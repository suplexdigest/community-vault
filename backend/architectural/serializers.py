from rest_framework import serializers

from .models import ARBRequest, ARBComment


class ARBCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.email", read_only=True)

    class Meta:
        model = ARBComment
        fields = "__all__"
        read_only_fields = ["id", "created_at", "author"]


class ARBRequestSerializer(serializers.ModelSerializer):
    property_unit = serializers.CharField(source="property.unit_number", read_only=True)
    property_address = serializers.CharField(source="property.address", read_only=True)
    owner_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.CharField(source="reviewed_by.email", read_only=True)
    comments = ARBCommentSerializer(many=True, read_only=True)

    class Meta:
        model = ARBRequest
        fields = "__all__"
        read_only_fields = ["id", "created_at"]

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}"


class ARBRequestListSerializer(serializers.ModelSerializer):
    property_unit = serializers.CharField(source="property.unit_number", read_only=True)
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = ARBRequest
        fields = [
            "id", "title", "project_type", "status", "property_unit",
            "owner_name", "estimated_cost", "created_at",
        ]

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}"
