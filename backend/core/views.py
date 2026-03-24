from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Community, Role, CommunitySettings
from .permissions import IsResident, IsBoardMember, IsManagerOrAbove, IsAdmin
from .serializers import (
    UserSerializer, UserCreateSerializer, PasswordChangeSerializer,
    CommunitySerializer, CommunityListSerializer,
    RoleSerializer, CommunitySettingsSerializer,
)
from .throttles import RegisterRateThrottle

User = get_user_model()

_2FA_CACHE_PREFIX = "cv_2fa_"


# ---- Auth views ----

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    throttle = RegisterRateThrottle()
    if not throttle.allow_request(request, None):
        return Response({"detail": "Too many registration attempts."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    serializer = UserCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == "GET":
        return Response(UserSerializer(request.user).data)
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def password_change(request):
    serializer = PasswordChangeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    if not request.user.check_password(serializer.validated_data["old_password"]):
        return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
    request.user.set_password(serializer.validated_data["new_password"])
    request.user.save()
    return Response({"detail": "Password changed successfully."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_roles(request):
    roles = Role.objects.filter(user=request.user).select_related("community")
    return Response(RoleSerializer(roles, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_communities(request):
    community_ids = Role.objects.filter(user=request.user).values_list("community_id", flat=True)
    communities = Community.objects.filter(id__in=community_ids, is_active=True)
    return Response(CommunityListSerializer(communities, many=True).data)


# ---- Dashboard ----

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsResident])
def dashboard_stats(request):
    community_id = request.headers.get("X-Community-Id")
    if not community_id:
        return Response({"detail": "X-Community-Id header required."}, status=status.HTTP_400_BAD_REQUEST)

    from properties.models import Property, Owner
    from finances.models import Assessment
    from violations.models import Violation
    from maintenance.models import WorkOrder

    now = timezone.now()
    stats = {
        "total_properties": Property.objects.filter(community_id=community_id).count(),
        "occupied_properties": Property.objects.filter(community_id=community_id, is_occupied=True).count(),
        "total_owners": Owner.objects.filter(community_id=community_id, is_current=True).count(),
        "overdue_assessments": Assessment.objects.filter(
            community_id=community_id, status="overdue"
        ).count(),
        "overdue_amount": Assessment.objects.filter(
            community_id=community_id, status="overdue"
        ).aggregate(total=Sum("amount"))["total"] or 0,
        "open_violations": Violation.objects.filter(
            community_id=community_id, status__in=["open", "notice_sent", "escalated"]
        ).count(),
        "open_work_orders": WorkOrder.objects.filter(
            community_id=community_id, status__in=["submitted", "acknowledged", "in_progress"]
        ).count(),
    }
    return Response(stats)


# ---- Community viewset ----

class CommunityViewSet(viewsets.ModelViewSet):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated, IsManagerOrAbove]
    lookup_field = "slug"

    def get_queryset(self):
        community_ids = Role.objects.filter(user=self.request.user).values_list("community_id", flat=True)
        return self.queryset.filter(id__in=community_ids)

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated(), IsResident()]
        return super().get_permissions()


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.select_related("user", "community")
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsManagerOrAbove]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        return self.queryset.filter(community_id=community_id)


class CommunitySettingsViewSet(viewsets.ModelViewSet):
    queryset = CommunitySettings.objects.select_related("community")
    serializer_class = CommunitySettingsSerializer
    permission_classes = [IsAuthenticated, IsManagerOrAbove]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        return self.queryset.filter(community_id=community_id)
