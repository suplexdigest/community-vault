from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsResident, IsTreasurerOrAbove, IsResidentReadBoardWrite
from .models import Assessment, Payment, Vendor, BudgetCategory, Budget, Expense, ReserveFund
from .serializers import (
    AssessmentSerializer, PaymentSerializer, VendorSerializer,
    BudgetCategorySerializer, BudgetSerializer, ExpenseSerializer, ReserveFundSerializer,
)


class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.select_related("property", "owner")
    serializer_class = AssessmentSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["owner__first_name", "owner__last_name", "property__unit_number"]
    ordering_fields = ["due_date", "amount", "status", "created_at"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        assessment_type = self.request.query_params.get("assessment_type")
        if assessment_type:
            qs = qs.filter(assessment_type=assessment_type)
        owner_id = self.request.query_params.get("owner_id")
        if owner_id:
            qs = qs.filter(owner_id=owner_id)
        property_id = self.request.query_params.get("property_id")
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("assessment", "owner", "created_by")
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsTreasurerOrAbove]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["owner__first_name", "owner__last_name", "check_number", "transaction_id"]
    ordering_fields = ["payment_date", "amount"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        owner_id = self.request.query_params.get("owner_id")
        if owner_id:
            qs = qs.filter(owner_id=owner_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "contact_name", "specialty"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")
        return qs


class BudgetCategoryViewSet(viewsets.ModelViewSet):
    queryset = BudgetCategory.objects.all()
    serializer_class = BudgetCategorySerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        return self.queryset.filter(community_id=community_id)


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.select_related("category")
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["fiscal_year"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        fiscal_year = self.request.query_params.get("fiscal_year")
        if fiscal_year:
            qs = qs.filter(fiscal_year=fiscal_year)
        return qs


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related("vendor", "category", "approved_by")
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated, IsTreasurerOrAbove]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["description", "vendor__name"]
    ordering_fields = ["expense_date", "amount", "status"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class ReserveFundViewSet(viewsets.ModelViewSet):
    queryset = ReserveFund.objects.all()
    serializer_class = ReserveFundSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        return self.queryset.filter(community_id=community_id)
