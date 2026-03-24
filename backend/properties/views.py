from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsResident, IsResidentReadBoardWrite
from .models import Property, Owner, Resident, ParkingSpot
from .serializers import (
    PropertySerializer, OwnerSerializer, ResidentSerializer, ParkingSpotSerializer,
)


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["unit_number", "address"]
    ordering_fields = ["unit_number", "address", "created_at"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        property_type = self.request.query_params.get("property_type")
        if property_type:
            qs = qs.filter(property_type=property_type)
        is_occupied = self.request.query_params.get("is_occupied")
        if is_occupied is not None:
            qs = qs.filter(is_occupied=is_occupied.lower() == "true")
        return qs


class OwnerViewSet(viewsets.ModelViewSet):
    queryset = Owner.objects.select_related("property", "user")
    serializer_class = OwnerSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "email"]
    ordering_fields = ["last_name", "first_name"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        is_current = self.request.query_params.get("is_current")
        if is_current is not None:
            qs = qs.filter(is_current=is_current.lower() == "true")
        property_id = self.request.query_params.get("property_id")
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs


class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.select_related("property")
    serializer_class = ResidentSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "email"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        property_id = self.request.query_params.get("property_id")
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs


class ParkingSpotViewSet(viewsets.ModelViewSet):
    queryset = ParkingSpot.objects.select_related("property")
    serializer_class = ParkingSpotSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.SearchFilter]
    search_fields = ["spot_number", "location"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        spot_type = self.request.query_params.get("spot_type")
        if spot_type:
            qs = qs.filter(spot_type=spot_type)
        return qs
