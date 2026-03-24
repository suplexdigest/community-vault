"""
Notification services for sending email and SMS reminders.
"""
import logging
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

from core.models import Community
from finances.models import Assessment
from meetings.models import Meeting
from violations.models import Violation
from maintenance.models import WorkOrder
from .models import NotificationPreference, NotificationLog, ReminderSchedule

logger = logging.getLogger(__name__)


def _get_preference(user, community, notification_type):
    """Get the user's channel preference for a notification type."""
    try:
        pref = NotificationPreference.objects.get(user=user, community=community)
        return getattr(pref, notification_type, "email")
    except NotificationPreference.DoesNotExist:
        return "email"


def _send_email(community, recipient, subject, html_body, notification_type):
    """Send an email notification and log it."""
    plain_body = strip_tags(html_body)
    try:
        send_mail(
            subject=subject,
            message=plain_body,
            html_message=html_body,
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else None,
            recipient_list=[recipient.email],
            fail_silently=False,
        )
        NotificationLog.objects.create(
            community=community,
            recipient=recipient,
            recipient_email=recipient.email,
            channel="email",
            notification_type=notification_type,
            subject=subject,
            body=plain_body,
            status="sent",
        )
        return True
    except Exception as e:
        logger.error(f"Email failed to {recipient.email}: {e}")
        NotificationLog.objects.create(
            community=community,
            recipient=recipient,
            recipient_email=recipient.email,
            channel="email",
            notification_type=notification_type,
            subject=subject,
            body=plain_body,
            status="failed",
            error_message=str(e),
        )
        return False


def _send_sms(community, recipient, message, notification_type):
    """Send an SMS notification via Twilio (or log if not configured)."""
    phone = getattr(recipient, 'phone', '') or ''
    if not phone:
        logger.warning(f"No phone number for {recipient.email}, skipping SMS")
        return False

    # Check if Twilio is configured
    twilio_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
    twilio_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '')
    twilio_from = getattr(settings, 'TWILIO_FROM_NUMBER', '')

    if twilio_sid and twilio_token and twilio_from:
        try:
            from twilio.rest import Client
            client = Client(twilio_sid, twilio_token)
            client.messages.create(
                body=message,
                from_=twilio_from,
                to=phone,
            )
            NotificationLog.objects.create(
                community=community,
                recipient=recipient,
                recipient_phone=phone,
                channel="sms",
                notification_type=notification_type,
                subject="",
                body=message,
                status="sent",
            )
            return True
        except Exception as e:
            logger.error(f"SMS failed to {phone}: {e}")
            NotificationLog.objects.create(
                community=community,
                recipient=recipient,
                recipient_phone=phone,
                channel="sms",
                notification_type=notification_type,
                subject="",
                body=message,
                status="failed",
                error_message=str(e),
            )
            return False
    else:
        # Log as queued (Twilio not configured)
        NotificationLog.objects.create(
            community=community,
            recipient=recipient,
            recipient_phone=phone,
            channel="sms",
            notification_type=notification_type,
            subject="",
            body=message,
            status="queued",
            error_message="Twilio not configured",
        )
        return False


def send_notification(community, recipient, notification_type, subject, html_body, sms_body=None):
    """Send notification via user's preferred channel."""
    channel = _get_preference(recipient, community, notification_type)
    results = []

    if channel in ("email", "both"):
        results.append(_send_email(community, recipient, subject, html_body, notification_type))

    if channel in ("sms", "both"):
        results.append(_send_sms(community, recipient, sms_body or strip_tags(html_body)[:160], notification_type))

    return any(results)


# ─── Scheduled Reminder Functions ───────────────────────────────────────

def send_assessment_reminders():
    """Send reminders for upcoming and overdue assessments across all communities."""
    today = timezone.now().date()
    sent_count = 0

    for community in Community.objects.filter(is_active=True):
        schedule = ReminderSchedule.objects.filter(community=community).first()
        days_before = schedule.assessment_reminder_days_before if schedule else 7
        second_days = schedule.assessment_second_reminder_days if schedule else 3
        overdue_freq = schedule.overdue_reminder_frequency_days if schedule else 7

        # Upcoming assessments — first reminder
        upcoming = Assessment.objects.filter(
            community=community,
            status="pending",
            due_date=today + timedelta(days=days_before),
        ).select_related("owner", "owner__user", "property")

        for assessment in upcoming:
            if not assessment.owner or not assessment.owner.user:
                continue
            user = assessment.owner.user
            subject = f"[{community.name}] Assessment Due in {days_before} Days"
            html_body = (
                f"<h3>Assessment Reminder</h3>"
                f"<p>Hi {user.first_name},</p>"
                f"<p>Your {assessment.get_assessment_type_display()} assessment of "
                f"<strong>${assessment.amount:.2f}</strong> for {assessment.property.unit_number} "
                f"is due on <strong>{assessment.due_date.strftime('%B %d, %Y')}</strong>.</p>"
                f"<p>Please make your payment to avoid late fees.</p>"
                f"<p>— {community.name}</p>"
            )
            sms = f"{community.name}: ${assessment.amount:.2f} assessment due {assessment.due_date.strftime('%m/%d')}. Pay now to avoid late fees."
            send_notification(community, user, "assessment_reminders", subject, html_body, sms)
            sent_count += 1

        # Second reminder
        second = Assessment.objects.filter(
            community=community,
            status="pending",
            due_date=today + timedelta(days=second_days),
        ).select_related("owner", "owner__user", "property")

        for assessment in second:
            if not assessment.owner or not assessment.owner.user:
                continue
            user = assessment.owner.user
            subject = f"[{community.name}] Assessment Due in {second_days} Days — Final Reminder"
            html_body = (
                f"<h3>Final Assessment Reminder</h3>"
                f"<p>Hi {user.first_name},</p>"
                f"<p>This is a final reminder that your assessment of "
                f"<strong>${assessment.amount:.2f}</strong> for {assessment.property.unit_number} "
                f"is due on <strong>{assessment.due_date.strftime('%B %d, %Y')}</strong>.</p>"
                f"<p>Late fees will be applied after the due date.</p>"
                f"<p>— {community.name}</p>"
            )
            sms = f"FINAL REMINDER: ${assessment.amount:.2f} due {assessment.due_date.strftime('%m/%d')} for {community.name}. Pay now."
            send_notification(community, user, "assessment_reminders", subject, html_body, sms)
            sent_count += 1

        # Overdue assessments
        overdue = Assessment.objects.filter(
            community=community,
            status="overdue",
            due_date__lte=today,
        ).select_related("owner", "owner__user", "property")

        for assessment in overdue:
            if not assessment.owner or not assessment.owner.user:
                continue
            days_overdue = (today - assessment.due_date).days
            if days_overdue % overdue_freq != 0:
                continue
            user = assessment.owner.user
            balance = assessment.amount - (assessment.paid_amount or 0)
            subject = f"[{community.name}] Overdue Assessment — ${balance:.2f} Past Due"
            html_body = (
                f"<h3>Overdue Assessment Notice</h3>"
                f"<p>Hi {user.first_name},</p>"
                f"<p>Your assessment for {assessment.property.unit_number} is "
                f"<strong>{days_overdue} days overdue</strong>. "
                f"Outstanding balance: <strong>${balance:.2f}</strong>.</p>"
                f"<p>Please make payment immediately to avoid additional fees and collection action.</p>"
                f"<p>— {community.name}</p>"
            )
            sms = f"OVERDUE: ${balance:.2f} past due for {community.name}. {days_overdue} days late. Pay immediately."
            send_notification(community, user, "overdue_notices", subject, html_body, sms)
            sent_count += 1

    return sent_count


def send_meeting_reminders():
    """Send reminders for upcoming meetings."""
    now = timezone.now()
    today = now.date()
    sent_count = 0

    for community in Community.objects.filter(is_active=True):
        schedule = ReminderSchedule.objects.filter(community=community).first()
        days_before = schedule.meeting_reminder_days_before if schedule else 3

        # Multi-day advance reminder
        meetings = Meeting.objects.filter(
            community=community,
            status="scheduled",
            date=today + timedelta(days=days_before),
        )

        from core.models import Role
        members = Role.objects.filter(community=community).select_related("user")

        for meeting in meetings:
            for role in members:
                user = role.user
                subject = f"[{community.name}] Meeting Reminder: {meeting.title}"
                html_body = (
                    f"<h3>Upcoming Meeting</h3>"
                    f"<p>Hi {user.first_name},</p>"
                    f"<p><strong>{meeting.title}</strong> is scheduled for "
                    f"<strong>{meeting.date.strftime('%A, %B %d, %Y')}</strong> at "
                    f"<strong>{meeting.time.strftime('%I:%M %p') if meeting.time else 'TBD'}</strong>.</p>"
                    f"<p>Location: {meeting.location or 'TBD'}</p>"
                    f"{'<p>Virtual link: ' + meeting.virtual_link + '</p>' if meeting.virtual_link else ''}"
                    f"<p>— {community.name}</p>"
                )
                sms = f"{community.name}: {meeting.title} on {meeting.date.strftime('%m/%d')} at {meeting.time.strftime('%I:%M %p') if meeting.time else 'TBD'}."
                send_notification(community, user, "meeting_reminders", subject, html_body, sms)
                sent_count += 1

    return sent_count


def send_violation_cure_reminders():
    """Send reminders for violations approaching their cure deadline."""
    today = timezone.now().date()
    sent_count = 0

    for community in Community.objects.filter(is_active=True):
        schedule = ReminderSchedule.objects.filter(community=community).first()
        days_before = schedule.violation_cure_reminder_days_before if schedule else 3

        violations = Violation.objects.filter(
            community=community,
            status__in=["open", "notice_sent"],
            cure_deadline=today + timedelta(days=days_before),
        ).select_related("property", "violation_type")

        for violation in violations:
            # Find the property owner
            from properties.models import Owner
            owner = Owner.objects.filter(
                property=violation.property, is_current=True
            ).select_related("user").first()
            if not owner or not owner.user:
                continue

            user = owner.user
            subject = f"[{community.name}] Violation Cure Deadline in {days_before} Days"
            html_body = (
                f"<h3>Violation Cure Reminder</h3>"
                f"<p>Hi {user.first_name},</p>"
                f"<p>The cure deadline for violation <strong>{violation.violation_type.name}</strong> "
                f"at <strong>{violation.property.unit_number}</strong> is "
                f"<strong>{violation.cure_deadline.strftime('%B %d, %Y')}</strong> "
                f"({days_before} days from now).</p>"
                f"<p>Please resolve the issue before the deadline to avoid fines.</p>"
                f"<p>— {community.name}</p>"
            )
            sms = f"{community.name}: Violation cure deadline in {days_before} days for {violation.property.unit_number}. Resolve to avoid fines."
            send_notification(community, user, "violation_notices", subject, html_body, sms)
            sent_count += 1

    return sent_count


def send_work_order_stale_alerts():
    """Alert managers about work orders that have gone stale."""
    today = timezone.now().date()
    sent_count = 0

    for community in Community.objects.filter(is_active=True):
        schedule = ReminderSchedule.objects.filter(community=community).first()
        stale_days = schedule.work_order_stale_days if schedule else 14

        stale_orders = WorkOrder.objects.filter(
            community=community,
            status__in=["submitted", "acknowledged", "in_progress"],
            created_at__date__lte=today - timedelta(days=stale_days),
        ).select_related("property")

        if not stale_orders.exists():
            continue

        # Notify managers and admins
        from core.models import Role
        managers = Role.objects.filter(
            community=community,
            role__in=["manager", "admin", "president"],
        ).select_related("user")

        for role in managers:
            user = role.user
            count = stale_orders.count()
            subject = f"[{community.name}] {count} Stale Work Order{'s' if count != 1 else ''}"
            items = "".join(
                f"<li>#{wo.id} — {wo.title} ({wo.property.unit_number if wo.property else 'Common Area'}) — {(today - wo.created_at.date()).days} days old</li>"
                for wo in stale_orders[:10]
            )
            html_body = (
                f"<h3>Stale Work Orders</h3>"
                f"<p>Hi {user.first_name},</p>"
                f"<p>The following work orders have been open for more than {stale_days} days:</p>"
                f"<ul>{items}</ul>"
                f"{'<p>...and more</p>' if count > 10 else ''}"
                f"<p>Please review and update their status.</p>"
                f"<p>— {community.name}</p>"
            )
            sms = f"{community.name}: {count} work order{'s' if count != 1 else ''} stale for {stale_days}+ days. Review needed."
            send_notification(community, user, "work_order_updates", subject, html_body, sms)
            sent_count += 1

    return sent_count
