from datetime import timedelta

from django.db.models import Sum, Count, Q, Avg, F
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsBoardMember
from properties.models import Property, Owner
from finances.models import Assessment, Payment, Expense, ReserveFund, Budget
from violations.models import Violation
from maintenance.models import WorkOrder


def _get_community_id(request):
    return request.headers.get("X-Community-Id")


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsBoardMember])
def financial_summary(request):
    """Financial summary: income, expenses, reserves, delinquencies."""
    community_id = _get_community_id(request)
    now = timezone.now()
    year = request.query_params.get("year", now.year)

    total_assessed = Assessment.objects.filter(
        community_id=community_id, due_date__year=year
    ).aggregate(total=Sum("amount"))["total"] or 0

    total_collected = Payment.objects.filter(
        community_id=community_id, payment_date__year=year
    ).aggregate(total=Sum("amount"))["total"] or 0

    total_expenses = Expense.objects.filter(
        community_id=community_id, expense_date__year=year, status="paid"
    ).aggregate(total=Sum("amount"))["total"] or 0

    overdue_amount = Assessment.objects.filter(
        community_id=community_id, status="overdue"
    ).aggregate(total=Sum("amount"))["total"] or 0

    reserves = ReserveFund.objects.filter(community_id=community_id).aggregate(
        total_balance=Sum("current_balance"),
        total_target=Sum("target_amount"),
    )

    return Response({
        "year": year,
        "total_assessed": total_assessed,
        "total_collected": total_collected,
        "collection_rate": round(float(total_collected) / float(total_assessed) * 100, 1) if total_assessed else 0,
        "total_expenses": total_expenses,
        "net_income": float(total_collected) - float(total_expenses),
        "overdue_amount": overdue_amount,
        "reserve_balance": reserves["total_balance"] or 0,
        "reserve_target": reserves["total_target"] or 0,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsBoardMember])
def delinquency_report(request):
    """Owners with unpaid/overdue assessments."""
    community_id = _get_community_id(request)

    delinquent = Assessment.objects.filter(
        community_id=community_id, status__in=["overdue", "partial"]
    ).values(
        "owner__id", "owner__first_name", "owner__last_name", "owner__email",
        "property__unit_number", "property__address",
    ).annotate(
        total_owed=Sum("amount"),
        total_paid=Sum("paid_amount"),
        count=Count("id"),
    ).order_by("-total_owed")

    results = []
    for d in delinquent:
        results.append({
            "owner_id": d["owner__id"],
            "owner_name": f"{d['owner__first_name']} {d['owner__last_name']}",
            "owner_email": d["owner__email"],
            "property_unit": d["property__unit_number"],
            "property_address": d["property__address"],
            "total_owed": d["total_owed"],
            "total_paid": d["total_paid"],
            "balance_due": float(d["total_owed"] or 0) - float(d["total_paid"] or 0),
            "assessment_count": d["count"],
        })

    return Response(results)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsBoardMember])
def violation_summary(request):
    """Violation summary: open, closed, by type."""
    community_id = _get_community_id(request)

    status_counts = Violation.objects.filter(
        community_id=community_id
    ).values("status").annotate(count=Count("id")).order_by("status")

    by_type = Violation.objects.filter(
        community_id=community_id
    ).values(
        "violation_type__name", "violation_type__category"
    ).annotate(count=Count("id")).order_by("-count")

    by_priority = Violation.objects.filter(
        community_id=community_id,
        status__in=["open", "notice_sent", "escalated"]
    ).values("priority").annotate(count=Count("id"))

    return Response({
        "by_status": list(status_counts),
        "by_type": list(by_type),
        "by_priority": list(by_priority),
        "total_open": Violation.objects.filter(
            community_id=community_id,
            status__in=["open", "notice_sent", "escalated"]
        ).count(),
        "total_closed": Violation.objects.filter(
            community_id=community_id, status__in=["cured", "closed"]
        ).count(),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsBoardMember])
def maintenance_summary(request):
    """Maintenance summary: open work orders, avg resolution time."""
    community_id = _get_community_id(request)

    status_counts = WorkOrder.objects.filter(
        community_id=community_id
    ).values("status").annotate(count=Count("id")).order_by("status")

    by_priority = WorkOrder.objects.filter(
        community_id=community_id,
        status__in=["submitted", "acknowledged", "in_progress"]
    ).values("priority").annotate(count=Count("id"))

    # Average resolution time for completed orders
    completed = WorkOrder.objects.filter(
        community_id=community_id, status__in=["completed", "closed"],
        completed_date__isnull=False,
    )
    avg_resolution = None
    if completed.exists():
        total_days = 0
        count = 0
        for wo in completed:
            if wo.completed_date and wo.created_at:
                delta = wo.completed_date - wo.created_at.date()
                total_days += delta.days
                count += 1
        if count > 0:
            avg_resolution = round(total_days / count, 1)

    return Response({
        "by_status": list(status_counts),
        "by_priority": list(by_priority),
        "total_open": WorkOrder.objects.filter(
            community_id=community_id,
            status__in=["submitted", "acknowledged", "in_progress"]
        ).count(),
        "avg_resolution_days": avg_resolution,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsBoardMember])
def owner_directory(request):
    """Owner directory report."""
    community_id = _get_community_id(request)

    owners = Owner.objects.filter(
        community_id=community_id, is_current=True
    ).select_related("property").order_by("last_name", "first_name")

    results = []
    for o in owners:
        results.append({
            "id": o.id,
            "first_name": o.first_name,
            "last_name": o.last_name,
            "email": o.email,
            "phone": o.phone,
            "property_unit": o.property.unit_number,
            "property_address": o.property.address,
            "is_primary": o.is_primary,
            "ownership_start_date": o.ownership_start_date,
        })

    return Response(results)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsBoardMember])
def assessment_aging(request):
    """Assessment aging report: 30/60/90/120+ days."""
    community_id = _get_community_id(request)
    now = timezone.now().date()

    overdue = Assessment.objects.filter(
        community_id=community_id, status__in=["overdue", "partial"]
    )

    buckets = {
        "current": {"count": 0, "amount": 0},
        "30_days": {"count": 0, "amount": 0},
        "60_days": {"count": 0, "amount": 0},
        "90_days": {"count": 0, "amount": 0},
        "120_plus": {"count": 0, "amount": 0},
    }

    for a in overdue:
        days_overdue = (now - a.due_date).days
        balance = float(a.amount) - float(a.paid_amount)
        if days_overdue <= 0:
            buckets["current"]["count"] += 1
            buckets["current"]["amount"] += balance
        elif days_overdue <= 30:
            buckets["30_days"]["count"] += 1
            buckets["30_days"]["amount"] += balance
        elif days_overdue <= 60:
            buckets["60_days"]["count"] += 1
            buckets["60_days"]["amount"] += balance
        elif days_overdue <= 90:
            buckets["90_days"]["count"] += 1
            buckets["90_days"]["amount"] += balance
        else:
            buckets["120_plus"]["count"] += 1
            buckets["120_plus"]["amount"] += balance

    # Round amounts
    for key in buckets:
        buckets[key]["amount"] = round(buckets[key]["amount"], 2)

    return Response(buckets)
