"""
Seed demo data for CommunityVault HOA Management.
Usage: python manage.py seed_demo [--reset]
"""
from datetime import timedelta, date, time
from decimal import Decimal
import random

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

from core.models import Community, Role, CommunitySettings
from properties.models import Property, Owner, Resident, ParkingSpot
from finances.models import Assessment, Payment, Vendor, BudgetCategory, Budget, Expense, ReserveFund
from violations.models import ViolationType, Violation, ViolationNotice, Fine
from maintenance.models import MaintenanceCategory, WorkOrder, WorkOrderComment
from meetings.models import Meeting, AgendaItem, Minutes, Vote, Ballot
from documents.models import DocumentCategory, Document
from architectural.models import ARBRequest
from communications.models import Announcement, EmergencyAlert
from amenities.models import Amenity, Reservation
from notifications.models import ReminderSchedule

User = get_user_model()


class Command(BaseCommand):
    help = "Seed demo data for CommunityVault"

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Delete existing demo data first")

    def handle(self, *args, **options):
        if options["reset"]:
            self.stdout.write("Resetting demo data...")
            Community.objects.filter(slug="oakwood-estates").delete()
            User.objects.filter(username__startswith="demo_").delete()

        self.stdout.write("Creating CommunityVault demo data...")
        today = timezone.now().date()

        # ─── Community ──────────────────────────────────────────
        community, _ = Community.objects.get_or_create(
            slug="oakwood-estates",
            defaults={
                "name": "Oakwood Estates HOA",
                "address": "100 Oakwood Drive",
                "city": "Stamford",
                "state": "CT",
                "zip_code": "06901",
                "phone": "(203) 555-0100",
                "email": "board@oakwoodestates.org",
                "website": "https://oakwoodestates.org",
                "total_units": 150,
                "monthly_assessment": Decimal("325.00"),
                "fiscal_year_start": 1,
                "plan": "pro",
                "is_active": True,
                "features": [
                    "properties", "finances", "violations", "maintenance",
                    "meetings", "documents", "architectural", "communications",
                    "amenities", "reports", "notifications",
                ],
            },
        )
        self.stdout.write(f"  Community: {community.name}")

        CommunitySettings.objects.get_or_create(
            community=community,
            defaults={
                "late_fee_amount": Decimal("25.00"),
                "late_fee_percentage": Decimal("5.0"),
                "grace_period_days": 15,
                "violation_fine_default": Decimal("50.00"),
                "auto_late_fees": True,
                "require_architectural_approval": True,
            },
        )

        ReminderSchedule.objects.get_or_create(community=community)

        # ─── Users ──────────────────────────────────────────────
        admin_user = self._create_user("demo_admin", "Admin", "Thompson", "admin@oakwoodestates.org")
        president = self._create_user("demo_president", "Margaret", "Chen", "mchen@email.com", phone="(203) 555-0101")
        treasurer = self._create_user("demo_treasurer", "Robert", "Williams", "rwilliams@email.com", phone="(203) 555-0102")
        secretary = self._create_user("demo_secretary", "Linda", "Martinez", "lmartinez@email.com", phone="(203) 555-0103")
        board1 = self._create_user("demo_board1", "James", "Patterson", "jpatterson@email.com")
        board2 = self._create_user("demo_board2", "Susan", "Kim", "skim@email.com")
        manager = self._create_user("demo_manager", "David", "Reeves", "dreeves@propmanage.com", phone="(203) 555-0200")

        residents = []
        resident_data = [
            ("demo_r1", "Michael", "Johnson", "mjohnson@email.com"),
            ("demo_r2", "Sarah", "Davis", "sdavis@email.com"),
            ("demo_r3", "John", "Wilson", "jwilson@email.com"),
            ("demo_r4", "Emily", "Brown", "ebrown@email.com"),
            ("demo_r5", "Daniel", "Taylor", "dtaylor@email.com"),
            ("demo_r6", "Jessica", "Anderson", "janderson@email.com"),
            ("demo_r7", "Christopher", "Thomas", "cthomas@email.com"),
            ("demo_r8", "Amanda", "Jackson", "ajackson@email.com"),
            ("demo_r9", "Matthew", "White", "mwhite@email.com"),
            ("demo_r10", "Jennifer", "Harris", "jharris@email.com"),
            ("demo_r11", "Andrew", "Clark", "aclark@email.com"),
            ("demo_r12", "Nicole", "Lewis", "nlewis@email.com"),
        ]
        for uname, first, last, email in resident_data:
            residents.append(self._create_user(uname, first, last, email))

        # ─── Roles ──────────────────────────────────────────────
        Role.objects.get_or_create(user=admin_user, community=community, defaults={"role": "admin"})
        Role.objects.get_or_create(user=president, community=community, defaults={"role": "president"})
        Role.objects.get_or_create(user=treasurer, community=community, defaults={"role": "treasurer"})
        Role.objects.get_or_create(user=secretary, community=community, defaults={"role": "secretary"})
        Role.objects.get_or_create(user=board1, community=community, defaults={"role": "board_member"})
        Role.objects.get_or_create(user=board2, community=community, defaults={"role": "board_member"})
        Role.objects.get_or_create(user=manager, community=community, defaults={"role": "manager"})
        for r in residents:
            Role.objects.get_or_create(user=r, community=community, defaults={"role": "resident"})
        self.stdout.write(f"  Users & roles: {7 + len(residents)} created")

        # ─── Properties ─────────────────────────────────────────
        all_board_users = [president, treasurer, secretary, board1, board2]
        all_owners_users = all_board_users + residents
        properties = []
        for i, user in enumerate(all_owners_users):
            prop = Property.objects.get_or_create(
                community=community,
                unit_number=f"{100 + i}",
                defaults={
                    "address": f"{100 + i} Oakwood Drive, Stamford CT 06901",
                    "property_type": random.choice(["single_family", "townhouse", "condo"]),
                    "square_footage": random.randint(1200, 3500),
                    "bedrooms": random.randint(2, 5),
                    "bathrooms": random.choice([1, 1.5, 2, 2.5, 3]),
                    "year_built": random.randint(1995, 2020),
                    "parking_spots": random.randint(1, 3),
                    "has_garage": random.choice([True, False]),
                    "is_occupied": True,
                },
            )[0]
            properties.append(prop)

            Owner.objects.get_or_create(
                community=community,
                property=prop,
                user=user,
                defaults={
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "is_primary": True,
                    "is_current": True,
                    "ownership_start_date": date(2020, 1, 1) + timedelta(days=random.randint(0, 1500)),
                },
            )

            Resident.objects.get_or_create(
                community=community,
                property=prop,
                first_name=user.first_name,
                last_name=user.last_name,
                defaults={
                    "email": user.email,
                    "is_owner": True,
                    "move_in_date": date(2020, 1, 1) + timedelta(days=random.randint(0, 1500)),
                },
            )

        self.stdout.write(f"  Properties: {len(properties)} created with owners")

        # ─── Vendors ────────────────────────────────────────────
        vendors = []
        vendor_data = [
            ("Green Thumb Landscaping", "Tom Green", "tom@greenthumb.com", "Landscaping"),
            ("Sparkle Pool Service", "Maria Lopez", "maria@sparklepool.com", "Pool Maintenance"),
            ("Premier Plumbing", "Mike Smith", "mike@premierplumb.com", "Plumbing"),
            ("Bright Electric", "Jane Doe", "jane@brightelectric.com", "Electrical"),
            ("CleanSweep Janitorial", "Carlos Rivera", "carlos@cleansweep.com", "Janitorial"),
            ("SafeGuard Security", "Bob Hall", "bob@safeguard.com", "Security"),
        ]
        for name, contact, email, specialty in vendor_data:
            v, _ = Vendor.objects.get_or_create(
                community=community, name=name,
                defaults={
                    "contact_name": contact, "email": email, "specialty": specialty,
                    "is_active": True, "w9_on_file": True,
                    "insurance_expiry": today + timedelta(days=random.randint(30, 365)),
                },
            )
            vendors.append(v)
        self.stdout.write(f"  Vendors: {len(vendors)}")

        # ─── Budget Categories ──────────────────────────────────
        income_cats = []
        expense_cats = []
        for name in ["HOA Assessments", "Late Fees", "Interest Income", "Amenity Fees"]:
            c, _ = BudgetCategory.objects.get_or_create(community=community, name=name, defaults={"category_type": "income"})
            income_cats.append(c)
        for name in ["Landscaping", "Pool Maintenance", "Insurance", "Utilities", "Repairs & Maintenance", "Management Fees", "Legal", "Reserve Contribution"]:
            c, _ = BudgetCategory.objects.get_or_create(community=community, name=name, defaults={"category_type": "expense"})
            expense_cats.append(c)

        # ─── Budgets ────────────────────────────────────────────
        year = today.year
        budget_amounts = {
            "HOA Assessments": 585000, "Late Fees": 5000, "Interest Income": 2000, "Amenity Fees": 3000,
            "Landscaping": 48000, "Pool Maintenance": 24000, "Insurance": 36000, "Utilities": 30000,
            "Repairs & Maintenance": 45000, "Management Fees": 60000, "Legal": 12000, "Reserve Contribution": 120000,
        }
        for cat in income_cats + expense_cats:
            Budget.objects.get_or_create(
                community=community, fiscal_year=year, category=cat,
                defaults={
                    "budgeted_amount": Decimal(str(budget_amounts.get(cat.name, 10000))),
                    "actual_amount": Decimal(str(int(budget_amounts.get(cat.name, 10000) * random.uniform(0.6, 0.9)))),
                },
            )

        # ─── Reserve Fund ───────────────────────────────────────
        ReserveFund.objects.get_or_create(
            community=community, name="Capital Reserve Fund",
            defaults={
                "target_amount": Decimal("500000.00"),
                "current_balance": Decimal("287500.00"),
                "description": "For major repairs: roofing, paving, siding, common area upgrades",
                "last_study_date": date(2024, 6, 1),
                "next_study_date": date(2027, 6, 1),
            },
        )

        # ─── Assessments & Payments ─────────────────────────────
        owners = Owner.objects.filter(community=community, is_current=True).select_related("user", "property")
        assessment_count = 0
        payment_count = 0
        for month_offset in range(6):
            period_start = date(year, today.month - 5 + month_offset, 1) if today.month - 5 + month_offset > 0 else date(year - 1, today.month + 7 + month_offset, 1)
            try:
                period_start = date(year, today.month - 5 + month_offset, 1)
            except ValueError:
                continue
            due_date = period_start + timedelta(days=14)

            for owner in owners:
                is_paid = random.random() < 0.85
                is_overdue = not is_paid and due_date < today
                a, created = Assessment.objects.get_or_create(
                    community=community,
                    property=owner.property,
                    owner=owner,
                    period_start=period_start,
                    defaults={
                        "amount": Decimal("325.00"),
                        "assessment_type": "regular",
                        "period_end": period_start + timedelta(days=29),
                        "due_date": due_date,
                        "status": "paid" if is_paid else ("overdue" if is_overdue else "pending"),
                        "paid_amount": Decimal("325.00") if is_paid else Decimal("0.00"),
                        "paid_date": due_date - timedelta(days=random.randint(0, 10)) if is_paid else None,
                    },
                )
                if created:
                    assessment_count += 1
                    if is_paid:
                        Payment.objects.create(
                            community=community,
                            assessment=a,
                            owner=owner,
                            amount=Decimal("325.00"),
                            payment_method=random.choice(["check", "ach", "online"]),
                            payment_date=a.paid_date,
                            created_by=admin_user,
                        )
                        payment_count += 1

        self.stdout.write(f"  Assessments: {assessment_count}, Payments: {payment_count}")

        # ─── Violation Types ────────────────────────────────────
        viol_types = []
        vtype_data = [
            ("Lawn Maintenance", "Grass exceeding 6 inches, unkempt landscaping", 50, "landscaping", 14),
            ("Unapproved Structure", "Structure built without ARB approval", 200, "architectural", 30),
            ("Trash Bins Visible", "Trash bins left visible from street after collection", 25, "trash", 7),
            ("Parking Violation", "Vehicle parked in restricted area or on lawn", 50, "parking", 3),
            ("Noise Complaint", "Excessive noise after 10 PM", 75, "noise", 1),
            ("Pet Violation", "Unleashed pet, pet waste not cleaned", 50, "pets", 7),
            ("Exterior Maintenance", "Peeling paint, damaged siding, broken fixtures", 100, "property_maintenance", 30),
        ]
        for name, desc, fine, cat, cure in vtype_data:
            vt, _ = ViolationType.objects.get_or_create(
                community=community, name=name,
                defaults={"description": desc, "default_fine": Decimal(str(fine)), "category": cat, "cure_period_days": cure},
            )
            viol_types.append(vt)

        # ─── Violations ─────────────────────────────────────────
        violation_count = 0
        statuses = ["open", "notice_sent", "cured", "fined", "closed"]
        for i in range(15):
            prop = random.choice(properties)
            vtype = random.choice(viol_types)
            status_choice = random.choice(statuses)
            observed = today - timedelta(days=random.randint(1, 90))
            v, created = Violation.objects.get_or_create(
                community=community,
                property=prop,
                violation_type=vtype,
                date_observed=observed,
                defaults={
                    "description": vtype.description,
                    "status": status_choice,
                    "priority": random.choice(["low", "medium", "high"]),
                    "cure_deadline": observed + timedelta(days=vtype.cure_period_days),
                    "cured_date": observed + timedelta(days=random.randint(3, 14)) if status_choice in ("cured", "closed") else None,
                    "reported_by": random.choice([admin_user, manager]),
                },
            )
            if created:
                violation_count += 1
                if status_choice in ("notice_sent", "fined", "cured", "closed"):
                    ViolationNotice.objects.create(
                        community=community,
                        violation=v,
                        notice_type="first_warning",
                        sent_date=observed + timedelta(days=1),
                        sent_via="email",
                        content=f"Notice: {vtype.name} violation observed at {prop.unit_number}.",
                        created_by=manager,
                    )
                if status_choice == "fined":
                    Fine.objects.create(
                        community=community,
                        violation=v,
                        amount=vtype.default_fine,
                        issued_date=observed + timedelta(days=vtype.cure_period_days + 1),
                        due_date=observed + timedelta(days=vtype.cure_period_days + 31),
                        status="pending",
                    )
        self.stdout.write(f"  Violations: {violation_count}")

        # ─── Maintenance Categories & Work Orders ───────────────
        maint_cats = []
        for name in ["Plumbing", "Electrical", "HVAC", "Landscaping", "Common Area", "Pool", "Roof/Exterior", "General"]:
            mc, _ = MaintenanceCategory.objects.get_or_create(community=community, name=name)
            maint_cats.append(mc)

        wo_count = 0
        wo_data = [
            ("Leaking faucet in unit bathroom", "submitted", "medium"),
            ("Pool pump making grinding noise", "in_progress", "high"),
            ("Broken light in parking lot B", "completed", "medium"),
            ("Clogged drain in common area bathroom", "submitted", "high"),
            ("Cracked sidewalk near entrance", "acknowledged", "low"),
            ("AC not cooling properly", "submitted", "high"),
            ("Mailbox cluster #3 lock broken", "in_progress", "medium"),
            ("Sprinkler head damaged on front lawn", "completed", "low"),
            ("Gate access code not working", "submitted", "emergency"),
            ("Water stain on clubhouse ceiling", "acknowledged", "medium"),
        ]
        for title, wo_status, priority in wo_data:
            prop = random.choice(properties) if "common" not in title.lower() else None
            wo, created = WorkOrder.objects.get_or_create(
                community=community,
                title=title,
                defaults={
                    "property": prop,
                    "requested_by": random.choice(residents),
                    "category": random.choice(maint_cats),
                    "description": f"{title}. Needs attention.",
                    "priority": priority,
                    "status": wo_status,
                    "assigned_vendor": random.choice(vendors) if wo_status in ("in_progress", "completed") else None,
                    "estimated_cost": Decimal(str(random.randint(50, 500))),
                    "actual_cost": Decimal(str(random.randint(50, 500))) if wo_status == "completed" else None,
                    "completed_date": timezone.now() - timedelta(days=random.randint(1, 10)) if wo_status == "completed" else None,
                },
            )
            if created:
                wo_count += 1
                if wo_status in ("in_progress", "completed"):
                    WorkOrderComment.objects.create(
                        work_order=wo,
                        author=manager,
                        content=f"Assigned to {wo.assigned_vendor.name if wo.assigned_vendor else 'staff'}. Will follow up.",
                        is_internal=False,
                    )
        self.stdout.write(f"  Work Orders: {wo_count}")

        # ─── Meetings ───────────────────────────────────────────
        meeting_data = [
            ("January Board Meeting", "board", date(year, 1, 15), time(19, 0)),
            ("February Board Meeting", "board", date(year, 2, 19), time(19, 0)),
            ("Annual Homeowner Meeting", "annual", date(year, 3, 8), time(10, 0)),
            ("April Board Meeting", "board", date(year, 4, 16), time(19, 0)),
            ("Budget Committee Meeting", "committee", date(year, 5, 10), time(18, 30)),
            ("Special Assessment Hearing", "special", today + timedelta(days=14), time(19, 0)),
            ("Next Board Meeting", "board", today + timedelta(days=21), time(19, 0)),
        ]
        for title, mtype, mdate, mtime in meeting_data:
            is_past = mdate < today
            m, _ = Meeting.objects.get_or_create(
                community=community,
                title=title,
                date=mdate,
                defaults={
                    "meeting_type": mtype,
                    "time": mtime,
                    "location": "Oakwood Estates Clubhouse",
                    "is_virtual": True,
                    "virtual_link": "https://zoom.us/j/1234567890",
                    "status": "completed" if is_past else "scheduled",
                    "created_by": secretary,
                },
            )
            AgendaItem.objects.get_or_create(
                meeting=m, title="Call to Order", defaults={"sort_order": 1, "item_type": "other", "time_allotted_minutes": 5}
            )
            AgendaItem.objects.get_or_create(
                meeting=m, title="Treasurer's Report", defaults={"sort_order": 2, "item_type": "report", "time_allotted_minutes": 15, "presenter": treasurer}
            )
            AgendaItem.objects.get_or_create(
                meeting=m, title="Old Business", defaults={"sort_order": 3, "item_type": "discussion", "time_allotted_minutes": 20}
            )
            AgendaItem.objects.get_or_create(
                meeting=m, title="New Business", defaults={"sort_order": 4, "item_type": "discussion", "time_allotted_minutes": 20}
            )
            if is_past:
                Minutes.objects.get_or_create(
                    meeting=m,
                    defaults={
                        "content": f"Minutes of {title}\n\nMeeting called to order at {mtime.strftime('%I:%M %p')}.\n\nTreasurer reported current balance and delinquencies.\nOld business items reviewed.\nNew business discussed.\n\nMeeting adjourned at {(mtime.hour + 1) % 24}:{mtime.minute:02d} PM.",
                        "approved": True,
                        "approved_date": mdate + timedelta(days=30),
                        "approved_by": president,
                        "created_by": secretary,
                    },
                )
        self.stdout.write(f"  Meetings: {len(meeting_data)} with agendas")

        # ─── Documents ──────────────────────────────────────────
        doc_cats = []
        for name in ["Governing Documents", "Financial Reports", "Meeting Minutes", "Forms", "Policies"]:
            dc, _ = DocumentCategory.objects.get_or_create(community=community, name=name)
            doc_cats.append(dc)

        doc_data = [
            ("CC&Rs - Oakwood Estates", "ccr", 0, True),
            ("Bylaws", "bylaws", 0, True),
            ("Rules & Regulations", "rules", 0, True),
            ("Architectural Review Guidelines", "rules", 0, True),
            ("2025 Annual Budget", "financial", 1, True),
            ("Q4 2025 Financial Statement", "financial", 1, False),
            ("Pool Rules & Hours", "rules", 4, True),
            ("New Homeowner Welcome Packet", "form", 3, True),
            ("Maintenance Request Form", "form", 3, True),
        ]
        for title, dtype, cat_idx, public in doc_data:
            Document.objects.get_or_create(
                community=community, title=title,
                defaults={
                    "category": doc_cats[cat_idx],
                    "document_type": dtype,
                    "uploaded_by": secretary,
                    "is_public": public,
                    "version": 1,
                },
            )
        self.stdout.write(f"  Documents: {len(doc_data)}")

        # ─── ARB Requests ───────────────────────────────────────
        arb_data = [
            ("Install backyard fence", "fence", "approved", 3500),
            ("Repaint exterior — new color", "exterior_paint", "approved_with_conditions", 2200),
            ("Solar panel installation", "solar", "under_review", 18000),
            ("Build front porch extension", "structure", "submitted", 12000),
            ("Replace garage door", "door", "approved", 1800),
        ]
        for title, ptype, arb_status, cost in arb_data:
            prop = random.choice(properties)
            owner = Owner.objects.filter(property=prop, is_current=True).first()
            if owner:
                ARBRequest.objects.get_or_create(
                    community=community,
                    property=prop,
                    title=title,
                    defaults={
                        "owner": owner,
                        "description": f"Request to {title.lower()} at {prop.unit_number}.",
                        "project_type": ptype,
                        "estimated_cost": Decimal(str(cost)),
                        "estimated_start_date": today + timedelta(days=random.randint(14, 60)),
                        "estimated_completion_date": today + timedelta(days=random.randint(60, 120)),
                        "status": arb_status,
                        "reviewed_by": president if arb_status not in ("submitted", "under_review") else None,
                        "review_date": today - timedelta(days=random.randint(1, 30)) if arb_status not in ("submitted", "under_review") else None,
                        "conditions": "Must match approved color palette" if arb_status == "approved_with_conditions" else "",
                    },
                )
        self.stdout.write(f"  ARB Requests: {len(arb_data)}")

        # ─── Announcements ──────────────────────────────────────
        ann_data = [
            ("Pool Opening May 25th", "normal", "all", False),
            ("Annual Meeting — March 8th", "important", "all", True),
            ("Street Repaving Schedule", "important", "owners", False),
            ("Holiday Decorations Policy Reminder", "normal", "all", False),
            ("Board Election Results", "important", "all", True),
            ("Water Main Repair — Temporary Shutoff", "urgent", "all", True),
        ]
        for title, priority, audience, pinned in ann_data:
            Announcement.objects.get_or_create(
                community=community,
                title=title,
                defaults={
                    "content": f"{title}\n\nMore details will be shared soon. Please contact the board with any questions.",
                    "priority": priority,
                    "target_audience": audience,
                    "is_pinned": pinned,
                    "published_date": timezone.now() - timedelta(days=random.randint(1, 60)),
                    "created_by": president,
                },
            )
        self.stdout.write(f"  Announcements: {len(ann_data)}")

        # ─── Amenities ──────────────────────────────────────────
        amenity_data = [
            ("Community Pool", "Olympic-sized pool with lap lanes and kids' area", "Pool Area", 50, True, 4),
            ("Clubhouse", "2,500 sq ft event space with kitchen", "Main Building", 80, True, 8),
            ("Tennis Courts", "Two regulation courts, first-come-first-served", "Sports Area", 4, False, 2),
            ("Fitness Center", "Full gym with cardio and weights", "Main Building", 20, False, 0),
            ("Playground", "Children's play area with equipment", "Park Area", None, False, 0),
            ("BBQ Pavilion", "Covered pavilion with 3 gas grills and picnic tables", "Park Area", 30, True, 4),
        ]
        amenities = []
        for name, desc, loc, cap, requires_res, max_hrs in amenity_data:
            a, _ = Amenity.objects.get_or_create(
                community=community, name=name,
                defaults={
                    "description": desc, "location": loc, "capacity": cap,
                    "requires_reservation": requires_res,
                    "reservation_max_hours": max_hrs or 4,
                    "is_active": True,
                },
            )
            amenities.append(a)

        # Add a few reservations
        for i in range(5):
            reservable = [a for a in amenities if a.requires_reservation]
            if reservable:
                amenity = random.choice(reservable)
                start = timezone.now() + timedelta(days=random.randint(1, 30), hours=random.randint(10, 16))
                Reservation.objects.get_or_create(
                    community=community,
                    amenity=amenity,
                    reserved_by=random.choice(residents),
                    start_datetime=start,
                    defaults={
                        "property": random.choice(properties),
                        "end_datetime": start + timedelta(hours=amenity.reservation_max_hours),
                        "guest_count": random.randint(5, 30),
                        "purpose": random.choice(["Birthday party", "Family gathering", "Swim practice", "HOA social"]),
                        "status": "approved",
                    },
                )
        self.stdout.write(f"  Amenities: {len(amenities)} with reservations")

        # ─── Expenses ───────────────────────────────────────────
        for i in range(20):
            cat = random.choice(expense_cats)
            Expense.objects.get_or_create(
                community=community,
                description=f"{cat.name} - Invoice #{1000 + i}",
                expense_date=today - timedelta(days=random.randint(1, 180)),
                defaults={
                    "vendor": random.choice(vendors),
                    "category": cat,
                    "amount": Decimal(str(random.randint(200, 5000))),
                    "status": random.choice(["approved", "paid", "paid", "paid"]),
                    "approved_by": treasurer,
                },
            )
        self.stdout.write(f"  Expenses: 20")

        # ─── Summary ────────────────────────────────────────────
        self.stdout.write(self.style.SUCCESS(
            f"\n{'='*60}\n"
            f"  CommunityVault demo data created!\n"
            f"  Community: Oakwood Estates HOA\n"
            f"  Units: 17 (of 150 total capacity)\n\n"
            f"  Login credentials (all passwords: Demo2024!):\n"
            f"    Admin:     demo_admin\n"
            f"    President: demo_president\n"
            f"    Treasurer: demo_treasurer\n"
            f"    Secretary: demo_secretary\n"
            f"    Manager:   demo_manager\n"
            f"    Resident:  demo_r1 through demo_r12\n"
            f"{'='*60}"
        ))

    def _create_user(self, username, first_name, last_name, email, phone=""):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "phone": phone,
                "is_verified": True,
            },
        )
        if created:
            user.set_password("Demo2024!")
            user.save()
        return user
