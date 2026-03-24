"""
Management command to send all scheduled reminders.
Run daily via cron: python manage.py send_reminders
"""
from django.core.management.base import BaseCommand
from notifications.services import (
    send_assessment_reminders,
    send_meeting_reminders,
    send_violation_cure_reminders,
    send_work_order_stale_alerts,
)


class Command(BaseCommand):
    help = "Send all scheduled email/SMS reminders (assessments, meetings, violations, work orders)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--type",
            choices=["assessments", "meetings", "violations", "work_orders", "all"],
            default="all",
            help="Which reminder type to send (default: all)",
        )

    def handle(self, *args, **options):
        reminder_type = options["type"]
        total = 0

        if reminder_type in ("assessments", "all"):
            count = send_assessment_reminders()
            self.stdout.write(f"  Assessment reminders sent: {count}")
            total += count

        if reminder_type in ("meetings", "all"):
            count = send_meeting_reminders()
            self.stdout.write(f"  Meeting reminders sent: {count}")
            total += count

        if reminder_type in ("violations", "all"):
            count = send_violation_cure_reminders()
            self.stdout.write(f"  Violation cure reminders sent: {count}")
            total += count

        if reminder_type in ("work_orders", "all"):
            count = send_work_order_stale_alerts()
            self.stdout.write(f"  Work order stale alerts sent: {count}")
            total += count

        self.stdout.write(self.style.SUCCESS(f"\nTotal notifications sent: {total}"))
