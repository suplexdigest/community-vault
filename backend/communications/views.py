from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsResident, IsBoardMember, IsResidentReadBoardWrite
from .models import Announcement, EmergencyAlert
from .serializers import AnnouncementSerializer, EmergencyAlertSerializer


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.select_related("created_by")
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "content"]
    ordering_fields = ["published_date", "priority"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        priority = self.request.query_params.get("priority")
        if priority:
            qs = qs.filter(priority=priority)
        target_audience = self.request.query_params.get("target_audience")
        if target_audience:
            qs = qs.filter(target_audience=target_audience)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class EmergencyAlertViewSet(viewsets.ModelViewSet):
    queryset = EmergencyAlert.objects.select_related("sent_by")
    serializer_class = EmergencyAlertSerializer
    permission_classes = [IsAuthenticated, IsBoardMember]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["sent_date"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")
        alert_type = self.request.query_params.get("alert_type")
        if alert_type:
            qs = qs.filter(alert_type=alert_type)
        return qs

    def perform_create(self, serializer):
        serializer.save(sent_by=self.request.user)

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated(), IsResident()]
        return super().get_permissions()
