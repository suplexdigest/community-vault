from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsResident, IsResidentReadBoardWrite
from .models import Amenity, Reservation
from .serializers import AmenitySerializer, ReservationSerializer


class AmenityViewSet(viewsets.ModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "location"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")
        return qs


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related("amenity", "reserved_by", "property")
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated, IsResident]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["start_datetime", "status", "created_at"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        amenity_id = self.request.query_params.get("amenity_id")
        if amenity_id:
            qs = qs.filter(amenity_id=amenity_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(reserved_by=self.request.user)
