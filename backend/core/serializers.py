from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Community, Role, CommunitySettings

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name",
            "phone", "avatar", "is_verified", "two_factor_enabled",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined", "is_verified"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "email", "username", "first_name", "last_name", "phone", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)


class CommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class CommunityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ["id", "name", "slug", "city", "state", "plan", "is_active", "total_units"]


class RoleSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_name = serializers.SerializerMethodField()
    community_name = serializers.CharField(source="community.name", read_only=True)

    class Meta:
        model = Role
        fields = [
            "id", "user", "community", "role",
            "user_email", "user_name", "community_name",
        ]

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email


class CommunitySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunitySettings
        fields = "__all__"
        read_only_fields = ["id", "community"]
