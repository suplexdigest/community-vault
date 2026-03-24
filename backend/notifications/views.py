from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import NotificationPreference, NotificationLog, ReminderSchedule
from .serializers import NotificationPreferenceSerializer, NotificationLogSerializer, ReminderScheduleSerializer


class NotificationPreferenceView(APIView):
    """Get or update the current user's notification preferences."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        community_id = request.headers.get("X-Community-Id")
        if not community_id:
            return Response({"error": "X-Community-Id header required"}, status=400)
        pref, _ = NotificationPreference.objects.get_or_create(
            user=request.user, community_id=community_id
        )
        return Response(NotificationPreferenceSerializer(pref).data)

    def patch(self, request):
        community_id = request.headers.get("X-Community-Id")
        if not community_id:
            return Response({"error": "X-Community-Id header required"}, status=400)
        pref, _ = NotificationPreference.objects.get_or_create(
            user=request.user, community_id=community_id
        )
        serializer = NotificationPreferenceSerializer(pref, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class NotificationLogView(APIView):
    """List notification logs for the community (managers+)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        community_id = request.headers.get("X-Community-Id")
        if not community_id:
            return Response({"error": "X-Community-Id header required"}, status=400)
        logs = NotificationLog.objects.filter(community_id=community_id)[:100]
        return Response(NotificationLogSerializer(logs, many=True).data)


class ReminderScheduleView(APIView):
    """Get or update reminder schedules (managers+)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        community_id = request.headers.get("X-Community-Id")
        if not community_id:
            return Response({"error": "X-Community-Id header required"}, status=400)
        schedule, _ = ReminderSchedule.objects.get_or_create(community_id=community_id)
        return Response(ReminderScheduleSerializer(schedule).data)

    def patch(self, request):
        community_id = request.headers.get("X-Community-Id")
        if not community_id:
            return Response({"error": "X-Community-Id header required"}, status=400)
        schedule, _ = ReminderSchedule.objects.get_or_create(community_id=community_id)
        serializer = ReminderScheduleSerializer(schedule, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
