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

        # ─── Vendors (15+) ───────────────────────────────────────
        vendors = []
        vendor_data = [
            ("Green Thumb Landscaping", "Tom Green", "tom@greenthumb.com", "(203) 555-0301", "47 Garden Rd, Stamford CT 06902", "Landscaping", "CT-LC-29471"),
            ("Sparkle Pool Service", "Maria Lopez", "maria@sparklepool.com", "(203) 555-0302", "118 Aqua Ln, Norwalk CT 06851", "Pool Maintenance", "CT-PL-88234"),
            ("Premier Plumbing", "Mike Smith", "mike@premierplumb.com", "(203) 555-0303", "22 Pipe Way, Stamford CT 06901", "Plumbing", "CT-PB-55123"),
            ("Bright Electric", "Jane Doe", "jane@brightelectric.com", "(203) 555-0304", "900 Volt Ave, Stamford CT 06902", "Electrical", "CT-EL-41092"),
            ("CleanSweep Janitorial", "Carlos Rivera", "carlos@cleansweep.com", "(203) 555-0305", "310 Tidy Blvd, Bridgeport CT 06604", "Janitorial", ""),
            ("SafeGuard Security", "Bob Hall", "bob@safeguard.com", "(203) 555-0306", "55 Watch Tower Dr, Stamford CT 06901", "Security", "CT-SEC-72001"),
            ("Comfort HVAC Solutions", "Patricia Nguyen", "patricia@comforthvac.com", "(203) 555-0307", "73 Breeze Ct, Greenwich CT 06830", "HVAC", "CT-HC-33890"),
            ("Precision Pest Control", "Ray Burke", "ray@precisionpest.com", "(203) 555-0308", "14 Critter Ln, Darien CT 06820", "Pest Control", "CT-PC-18445"),
            ("AllWeather Roofing", "Frank Torres", "frank@allweatherroof.com", "(203) 555-0309", "821 Shingle Rd, Stamford CT 06902", "Roofing", "CT-RF-60217"),
            ("Hartford Insurance Group", "Diane Kowalski", "diane@hartfordins.com", "(860) 555-0400", "200 Insurance Plaza, Hartford CT 06103", "Insurance", "CT-INS-00142"),
            ("Granite State Paving", "Steve Mason", "steve@granitepaving.com", "(203) 555-0311", "450 Asphalt Way, Norwalk CT 06851", "Paving", "CT-PV-77563"),
            ("ProPaint Exteriors", "Angela Cruz", "angela@propaint.com", "(203) 555-0312", "66 Color St, Stamford CT 06901", "Painting", "CT-PT-24819"),
            ("TechConnect IT", "Kevin Zhao", "kevin@techconnect.com", "(203) 555-0313", "1200 Digital Dr, Stamford CT 06901", "Technology", ""),
            ("Elm City Legal", "Barbara Whitfield, Esq.", "bwhitfield@elmcitylegal.com", "(203) 555-0314", "88 Court St, New Haven CT 06510", "Legal", "CT-BAR-43271"),
            ("Summit Fire Protection", "Gary Hoffman", "gary@summitfire.com", "(203) 555-0315", "39 Alarm Rd, Bridgeport CT 06604", "Fire Safety", "CT-FP-91005"),
        ]
        for name, contact, email, phone, address, specialty, license_num in vendor_data:
            v, _ = Vendor.objects.get_or_create(
                community=community, name=name,
                defaults={
                    "contact_name": contact,
                    "email": email,
                    "phone": phone,
                    "address": address,
                    "specialty": specialty,
                    "license_number": license_num,
                    "is_active": True,
                    "w9_on_file": True,
                    "insurance_expiry": today + timedelta(days=random.randint(60, 365)),
                },
            )
            vendors.append(v)
        self.stdout.write(f"  Vendors: {len(vendors)}")

        # ─── Budget Categories (comprehensive) ───────────────────
        income_cats = []
        income_cat_data = [
            ("HOA Assessments", 1),
            ("Special Assessments", 2),
            ("Late Fees", 3),
            ("Interest Income", 4),
            ("Amenity Rental Fees", 5),
            ("Transfer Fees", 6),
            ("Violation Fines", 7),
            ("Parking Fees", 8),
            ("Laundry Revenue", 9),
            ("Other Income", 10),
        ]
        for name, sort in income_cat_data:
            c, _ = BudgetCategory.objects.get_or_create(
                community=community, name=name,
                defaults={"category_type": "income", "sort_order": sort},
            )
            income_cats.append(c)

        expense_cats = []
        expense_cat_data = [
            ("Landscaping & Grounds", 1),
            ("Pool Maintenance", 2),
            ("Building Maintenance", 3),
            ("Insurance (Property)", 4),
            ("Insurance (Liability)", 5),
            ("Insurance (D&O)", 6),
            ("Utilities (Electric)", 7),
            ("Utilities (Water/Sewer)", 8),
            ("Utilities (Gas)", 9),
            ("Utilities (Cable/Internet)", 10),
            ("Trash Removal", 11),
            ("Pest Control", 12),
            ("Elevator Maintenance", 13),
            ("Fire Safety", 14),
            ("Security & Access", 15),
            ("Management Fees", 16),
            ("Legal & Professional", 17),
            ("Accounting & Audit", 18),
            ("Tax Preparation", 19),
            ("Administrative/Office", 20),
            ("Reserve Contribution", 21),
            ("Roof Maintenance", 22),
            ("Paving/Concrete", 23),
            ("Painting", 24),
            ("Common Area Repairs", 25),
            ("Snow Removal", 26),
            ("Holiday Decorations", 27),
            ("Social Events", 28),
            ("Website/Software", 29),
            ("Banking Fees", 30),
        ]
        for name, sort in expense_cat_data:
            c, _ = BudgetCategory.objects.get_or_create(
                community=community, name=name,
                defaults={"category_type": "expense", "sort_order": sort},
            )
            expense_cats.append(c)
        self.stdout.write(f"  Budget Categories: {len(income_cats)} income, {len(expense_cats)} expense")

        # ─── Budgets ──────────────────────────────────────────────
        year = today.year
        budget_amounts = {
            # Income
            "HOA Assessments": 585000,
            "Special Assessments": 45000,
            "Late Fees": 5000,
            "Interest Income": 3200,
            "Amenity Rental Fees": 8500,
            "Transfer Fees": 6000,
            "Violation Fines": 4000,
            "Parking Fees": 2400,
            "Laundry Revenue": 1800,
            "Other Income": 1500,
            # Expenses
            "Landscaping & Grounds": 52000,
            "Pool Maintenance": 24000,
            "Building Maintenance": 36000,
            "Insurance (Property)": 28000,
            "Insurance (Liability)": 14000,
            "Insurance (D&O)": 6500,
            "Utilities (Electric)": 18000,
            "Utilities (Water/Sewer)": 22000,
            "Utilities (Gas)": 9600,
            "Utilities (Cable/Internet)": 4800,
            "Trash Removal": 14400,
            "Pest Control": 4800,
            "Elevator Maintenance": 7200,
            "Fire Safety": 3600,
            "Security & Access": 12000,
            "Management Fees": 60000,
            "Legal & Professional": 15000,
            "Accounting & Audit": 8500,
            "Tax Preparation": 3500,
            "Administrative/Office": 4200,
            "Reserve Contribution": 120000,
            "Roof Maintenance": 8000,
            "Paving/Concrete": 12000,
            "Painting": 15000,
            "Common Area Repairs": 10000,
            "Snow Removal": 18000,
            "Holiday Decorations": 2500,
            "Social Events": 6000,
            "Website/Software": 3600,
            "Banking Fees": 1200,
        }
        for cat in income_cats + expense_cats:
            Budget.objects.get_or_create(
                community=community, fiscal_year=year, category=cat,
                defaults={
                    "budgeted_amount": Decimal(str(budget_amounts.get(cat.name, 5000))),
                    "actual_amount": Decimal(str(int(budget_amounts.get(cat.name, 5000) * random.uniform(0.55, 0.92)))),
                },
            )

        # ─── Reserve Funds (3) ─────────────────────────────────────
        ReserveFund.objects.get_or_create(
            community=community, name="Capital Reserve Fund",
            defaults={
                "target_amount": Decimal("500000.00"),
                "current_balance": Decimal("287500.00"),
                "description": "For major capital improvements: roofing, siding replacement, common area renovations, elevator modernization, and building envelope repairs.",
                "last_study_date": date(2024, 6, 1),
                "next_study_date": date(2027, 6, 1),
            },
        )
        ReserveFund.objects.get_or_create(
            community=community, name="Pool Reserve Fund",
            defaults={
                "target_amount": Decimal("75000.00"),
                "current_balance": Decimal("41200.00"),
                "description": "Dedicated reserve for pool resurfacing, equipment replacement, deck repairs, and filtration system upgrades.",
                "last_study_date": date(2024, 6, 1),
                "next_study_date": date(2027, 6, 1),
            },
        )
        ReserveFund.objects.get_or_create(
            community=community, name="Infrastructure Reserve",
            defaults={
                "target_amount": Decimal("200000.00"),
                "current_balance": Decimal("112750.00"),
                "description": "For parking lot resurfacing, storm drainage improvements, retaining walls, irrigation system overhaul, and roadway repairs.",
                "last_study_date": date(2025, 1, 15),
                "next_study_date": date(2028, 1, 15),
            },
        )
        self.stdout.write("  Reserve Funds: 3")

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

        # ─── Violation Types (30+) ─────────────────────────────────
        viol_types = []
        vtype_data = [
            # Property Maintenance
            ("Peeling/Chipping Paint", "Exterior paint that is peeling, chipping, fading, or otherwise deteriorated", 100, "property_maintenance", 30),
            ("Damaged Siding", "Siding that is cracked, broken, warped, or missing sections", 150, "property_maintenance", 30),
            ("Broken Windows", "Cracked, broken, or boarded-up windows visible from common areas", 150, "property_maintenance", 14),
            ("Mold/Mildew on Exterior", "Visible mold, mildew, or algae growth on exterior surfaces", 75, "property_maintenance", 21),
            ("Roof Damage", "Missing shingles, visible damage, or deterioration of roofing materials", 200, "property_maintenance", 30),
            ("Gutter/Downspout Issues", "Clogged, sagging, detached, or missing gutters and downspouts", 75, "property_maintenance", 21),
            ("Driveway Cracks/Damage", "Significant cracking, heaving, or deterioration of driveway surface", 100, "property_maintenance", 45),
            ("Dirty/Stained Exterior", "Exterior walls, walkways, or surfaces with excessive dirt, oil stains, or discoloration", 50, "property_maintenance", 21),
            # Landscaping
            ("Overgrown Grass/Weeds", "Grass exceeding 6 inches or uncontrolled weed growth in lawn or beds", 50, "landscaping", 7),
            ("Dead Trees/Shrubs", "Dead, dying, or severely diseased trees or shrubs not removed", 75, "landscaping", 21),
            ("Unapproved Plantings", "Trees, shrubs, or gardens planted without prior ARB approval", 100, "landscaping", 30),
            ("Leaf/Yard Debris", "Excessive accumulation of leaves, branches, or yard waste not cleaned up", 25, "landscaping", 7),
            ("Irrigation System Issues", "Broken sprinkler heads, water runoff onto sidewalks, or watering during restricted hours", 50, "landscaping", 14),
            ("Mulch/Ground Cover Deficiency", "Bare soil, eroded mulch, or missing ground cover in landscape beds", 50, "landscaping", 21),
            # Parking
            ("Unauthorized Vehicle", "Vehicle parked in reserved, fire lane, or restricted area without authorization", 75, "parking", 1),
            ("Commercial Vehicle Violation", "Commercial vehicle, trailer, or oversized vehicle stored in residential area", 100, "parking", 3),
            ("Inoperable Vehicle", "Vehicle with flat tires, expired registration, or otherwise non-operational stored on property", 150, "parking", 7),
            ("Blocking Fire Lane", "Vehicle parked in or blocking a designated fire lane", 250, "parking", 1),
            ("Guest Parking Abuse", "Resident or repeated visitor using designated guest parking spaces", 50, "parking", 3),
            ("Overnight Street Parking", "Vehicle parked on community streets between midnight and 6 AM", 50, "parking", 1),
            # Trash
            ("Trash Bins Visible", "Trash or recycling bins left visible from the street outside of collection day", 25, "trash", 2),
            ("Improper Recycling", "Non-recyclable materials placed in recycling bins or contaminated recycling", 25, "trash", 7),
            ("Bulk Trash Violation", "Large items or bulk trash left curbside outside scheduled pickup windows", 75, "trash", 3),
            ("Dumpster Misuse", "Improper use of community dumpster including dumping prohibited items", 100, "trash", 3),
            # Noise
            ("Excessive Noise After Hours", "Noise disturbance between 10 PM and 7 AM exceeding reasonable levels", 75, "noise", 1),
            ("Construction Noise Outside Hours", "Construction, power tools, or renovation work outside permitted hours (8 AM - 6 PM weekdays)", 100, "noise", 1),
            ("Barking Dogs", "Persistent or excessive dog barking that disturbs neighboring residents", 50, "noise", 7),
            # Pets
            ("Unleashed Pet", "Pet observed in common areas without a leash in violation of leash requirements", 75, "pets", 1),
            ("Aggressive Animal", "Animal exhibiting aggressive behavior toward residents, guests, or other pets", 200, "pets", 1),
            ("Excessive Pets", "Number of pets exceeds maximum allowed per governing documents (2 per unit)", 100, "pets", 14),
            ("Pet Waste Not Cleaned", "Pet waste left on common grounds, walkways, or neighboring properties", 50, "pets", 1),
            ("Unauthorized Pet Breed", "Restricted breed or exotic animal kept without board approval or insurance", 150, "pets", 14),
            # Architectural
            ("Unapproved Exterior Modification", "Structural or cosmetic change to exterior without ARB approval", 200, "architectural", 30),
            ("Satellite Dish Placement", "Satellite dish or antenna installed in unapproved location or size exceeding guidelines", 75, "architectural", 14),
            ("Holiday Decoration Timing", "Holiday decorations displayed outside the permitted window (30 days before to 15 days after)", 25, "architectural", 7),
            ("Signage Violation", "Unapproved signs, banners, or flags displayed on property exterior", 50, "architectural", 7),
            ("Unapproved Fencing", "Fence installed or modified without ARB approval or not conforming to standards", 150, "architectural", 30),
            ("Window Treatment Violation", "Non-conforming window coverings visible from exterior (sheets, foil, unapproved tints)", 50, "architectural", 14),
            # Other
            ("Holiday Lighting After Deadline", "Holiday lights or decorations remaining past the January 15th removal deadline", 25, "other", 7),
            ("Rental Violation", "Unit rented without proper board notification or in violation of rental cap", 500, "other", 14),
            ("Home Business Violation", "Operating a business from residence generating traffic, noise, or signage without approval", 200, "other", 14),
            ("Outdoor Storage Violation", "Unapproved storage shed, items on patio visible from common areas, or excessive clutter", 75, "other", 14),
            ("Unapproved Patio Furniture", "Non-conforming or excessive patio/balcony furniture visible from common areas", 25, "other", 14),
        ]
        for name, desc, fine, cat, cure in vtype_data:
            vt, _ = ViolationType.objects.get_or_create(
                community=community, name=name,
                defaults={"description": desc, "default_fine": Decimal(str(fine)), "category": cat, "cure_period_days": cure},
            )
            viol_types.append(vt)
        self.stdout.write(f"  Violation Types: {len(viol_types)}")

        # ─── Violations (25+) ──────────────────────────────────────
        violation_count = 0
        statuses = ["open", "notice_sent", "cured", "fined", "closed"]
        violation_details = [
            # Specific descriptions to make them feel real
            "Observed during routine community walkthrough by management.",
            "Reported by adjacent homeowner via online portal.",
            "Identified during quarterly property inspection.",
            "Complaint received from multiple residents.",
            "Noted during pre-annual meeting site review.",
            "Reported by landscaping vendor during scheduled service.",
            "Observed by board member during evening walk.",
            "Follow-up from previous warning that was not addressed.",
        ]
        for i in range(25):
            prop = random.choice(properties)
            vtype = random.choice(viol_types)
            status_choice = random.choice(statuses)
            observed = today - timedelta(days=random.randint(1, 120))
            detail = random.choice(violation_details)
            v, created = Violation.objects.get_or_create(
                community=community,
                property=prop,
                violation_type=vtype,
                date_observed=observed,
                defaults={
                    "description": f"{vtype.description} {detail}",
                    "status": status_choice,
                    "priority": random.choice(["low", "medium", "medium", "high"]),
                    "cure_deadline": observed + timedelta(days=vtype.cure_period_days),
                    "cured_date": observed + timedelta(days=random.randint(1, max(3, vtype.cure_period_days))) if status_choice in ("cured", "closed") else None,
                    "reported_by": random.choice([admin_user, manager, president, board1]),
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
                        sent_via=random.choice(["email", "mail", "both"]),
                        content=f"Dear Homeowner,\n\nThis letter serves as formal notice of a violation observed at your property (Unit {prop.unit_number}).\n\nViolation: {vtype.name}\nDate Observed: {observed.strftime('%B %d, %Y')}\nCure Deadline: {(observed + timedelta(days=vtype.cure_period_days)).strftime('%B %d, %Y')}\n\n{vtype.description}\n\nPlease remedy this issue within the specified cure period to avoid further action.\n\nSincerely,\nOakwood Estates HOA Board",
                        created_by=manager,
                    )
                if status_choice == "fined":
                    Fine.objects.create(
                        community=community,
                        violation=v,
                        amount=vtype.default_fine,
                        issued_date=observed + timedelta(days=vtype.cure_period_days + 1),
                        due_date=observed + timedelta(days=vtype.cure_period_days + 31),
                        status=random.choice(["pending", "pending", "paid"]),
                    )
                # Add a second notice for escalated/fined violations
                if status_choice == "fined":
                    ViolationNotice.objects.create(
                        community=community,
                        violation=v,
                        notice_type="final_notice",
                        sent_date=observed + timedelta(days=vtype.cure_period_days),
                        sent_via="both",
                        content=f"FINAL NOTICE: The violation at Unit {prop.unit_number} ({vtype.name}) has not been cured within the allowed period. A fine of ${vtype.default_fine} has been assessed.",
                        created_by=manager,
                    )
        self.stdout.write(f"  Violations: {violation_count}")

        # ─── Maintenance Categories (20) ────────────────────────────
        maint_cats = []
        maint_cat_names = [
            "Plumbing", "Electrical", "HVAC", "Landscaping", "Common Area",
            "Pool", "Roof/Exterior", "General", "Pest Control", "Elevator",
            "Fire Safety", "Security Systems", "Irrigation", "Painting",
            "Windows/Doors", "Paving/Concrete", "Fencing/Gates", "Lighting",
            "Janitorial", "Appliances",
        ]
        for name in maint_cat_names:
            mc, _ = MaintenanceCategory.objects.get_or_create(community=community, name=name)
            maint_cats.append(mc)
        self.stdout.write(f"  Maintenance Categories: {len(maint_cats)}")

        # Helper to find a maintenance category by name
        def get_maint_cat(name):
            for mc in maint_cats:
                if mc.name == name:
                    return mc
            return random.choice(maint_cats)

        # Helper to find a vendor by specialty keyword
        def get_vendor(keyword):
            for v in vendors:
                if keyword.lower() in v.specialty.lower():
                    return v
            return random.choice(vendors)

        # ─── Work Orders (25+) ────────────────────────────────────
        wo_count = 0
        wo_data = [
            ("Leaking faucet in unit bathroom", "submitted", "medium", "Plumbing", None, "Persistent drip from master bathroom faucet. Resident reports it started two weeks ago and is getting worse."),
            ("Pool pump making grinding noise", "in_progress", "high", "Pool", None, "Main circulation pump producing loud grinding sound. May need bearing replacement. Pool still operational but noise is significant."),
            ("Broken light in parking lot B", "completed", "medium", "Lighting", None, "Three LED fixtures in the southeast section of Lot B are out. Creates dark spot near handicap spaces. Safety concern."),
            ("Clogged drain in common area bathroom", "submitted", "high", "Plumbing", None, "Women's restroom in clubhouse has severely slow drain. Standing water after minimal use. Possible root intrusion."),
            ("Cracked sidewalk near entrance", "acknowledged", "low", "Paving/Concrete", None, "Section of sidewalk near main entrance gate has raised approximately 2 inches due to tree root. Trip hazard."),
            ("AC not cooling properly in clubhouse", "submitted", "high", "HVAC", None, "Main HVAC unit serving clubhouse great room not maintaining temperature. Currently 82F with thermostat set to 72F."),
            ("Mailbox cluster #3 lock broken", "in_progress", "medium", "General", None, "Master lock on cluster mailbox #3 (units 108-114) is jammed and will not open. Postmaster unable to deliver."),
            ("Sprinkler head damaged on front lawn", "completed", "low", "Irrigation", None, "Zone 4 sprinkler head near unit 103 was struck by mower. Water geysering when zone activates."),
            ("Gate access code not working", "submitted", "emergency", "Security Systems", None, "Main vehicle gate access code rejected for all residents since power outage. Manual override in use."),
            ("Water stain on clubhouse ceiling", "acknowledged", "medium", "Roof/Exterior", None, "Growing brown water stain on clubhouse ceiling near northeast corner. Approximately 3x4 feet. Possible roof leak."),
            ("Elevator making unusual sounds", "in_progress", "high", "Elevator", None, "Building A elevator producing screeching sound between floors 2 and 3. Residents reporting vibration. Inspection overdue."),
            ("Fire extinguisher expired — Bldg B", "submitted", "high", "Fire Safety", None, "Six fire extinguishers in Building B hallways show expired inspection tags. Last inspected March 2025."),
            ("Dog park fence section leaning", "acknowledged", "medium", "Fencing/Gates", None, "Northwest section of dog park fence leaning outward approximately 15 degrees. Two posts appear rotted at base."),
            ("Common area carpet staining", "submitted", "low", "Janitorial", None, "Lobby carpet in Building A has multiple stains near entrance from recent rain. Professional cleaning needed."),
            ("Exterior paint peeling — Bldg C south side", "acknowledged", "medium", "Painting", None, "Paint peeling in large sections on south-facing wall of Building C. Approximately 200 sq ft affected."),
            ("Fitness center treadmill #2 broken", "submitted", "medium", "General", None, "Second treadmill from left displays error code E7 and belt will not move. Screen flickers intermittently."),
            ("Playground swing set chain rusted", "in_progress", "high", "Common Area", None, "Two swing chains showing significant rust and thinning. Safety inspection recommended before continued use."),
            ("Parking lot pothole — Section D", "submitted", "medium", "Paving/Concrete", None, "Pothole approximately 18 inches wide and 4 inches deep forming near the speed bump in Section D. Growing weekly."),
            ("Pest control — ant infestation in clubhouse kitchen", "in_progress", "high", "Pest Control", None, "Large colony of carpenter ants discovered in clubhouse kitchen near dishwasher. Sawdust observed on counter."),
            ("Window cracked in common laundry room", "submitted", "medium", "Windows/Doors", None, "Lower pane of double-hung window in Building A laundry room has a spider crack. Still intact but compromised."),
            ("Community sign lighting burned out", "completed", "low", "Electrical", None, "Landscape uplights on main community entrance sign — two of four bulbs burned out. Sign not visible at night."),
            ("Tennis court net sagging", "acknowledged", "low", "Common Area", None, "Center strap on Court 1 net has stretched. Net height at center measures approximately 38 inches (should be 36)."),
            ("BBQ grill #2 igniter not working", "submitted", "low", "Common Area", None, "Center grill at pavilion will not ignite via electronic igniter. Gas flows but no spark. Residents using matches as workaround."),
            ("Storm drain backing up near unit 112", "submitted", "high", "Plumbing", None, "Storm drain grate near unit 112 overflows during moderate rain. Water pooling in parking area and approaching garage."),
            ("Clubhouse bathroom faucet sensor malfunction", "completed", "low", "Plumbing", None, "Automatic faucet in men's restroom runs continuously. Sensor appears to be stuck. Wasting significant water."),
        ]
        for title, wo_status, priority, cat_name, _, desc in wo_data:
            is_common = any(kw in title.lower() for kw in ["common", "pool", "clubhouse", "parking", "gate", "elevator", "playground", "fitness", "tennis", "bbq", "sign", "storm", "lobby"])
            prop = None if is_common else random.choice(properties)
            assigned_vendor = None
            if wo_status in ("in_progress", "completed"):
                # Try to match vendor to category
                cat_vendor_map = {
                    "Plumbing": "Plumbing", "Pool": "Pool", "Lighting": "Electric",
                    "HVAC": "HVAC", "Irrigation": "Landscaping", "Elevator": "Elevator",
                    "Fire Safety": "Fire", "Security Systems": "Security", "Pest Control": "Pest",
                    "Painting": "Paint", "Paving/Concrete": "Paving", "Fencing/Gates": "Fencing",
                    "Janitorial": "Janitorial", "Electrical": "Electric", "Roof/Exterior": "Roof",
                }
                vendor_kw = cat_vendor_map.get(cat_name, "")
                assigned_vendor = get_vendor(vendor_kw) if vendor_kw else random.choice(vendors)

            wo, created = WorkOrder.objects.get_or_create(
                community=community,
                title=title,
                defaults={
                    "property": prop,
                    "requested_by": random.choice(residents + [manager]),
                    "category": get_maint_cat(cat_name),
                    "description": desc,
                    "priority": priority,
                    "status": wo_status,
                    "assigned_vendor": assigned_vendor,
                    "estimated_cost": Decimal(str(random.randint(75, 2500))),
                    "actual_cost": Decimal(str(random.randint(75, 2500))) if wo_status == "completed" else None,
                    "scheduled_date": (today + timedelta(days=random.randint(1, 14))) if wo_status == "in_progress" else None,
                    "completed_date": (today - timedelta(days=random.randint(1, 21))) if wo_status == "completed" else None,
                },
            )
            if created:
                wo_count += 1
                if wo_status in ("in_progress", "completed"):
                    WorkOrderComment.objects.create(
                        work_order=wo,
                        author=manager,
                        content=f"Assigned to {wo.assigned_vendor.name if wo.assigned_vendor else 'maintenance staff'}. Vendor confirmed availability and will schedule accordingly.",
                        is_internal=False,
                    )
                if wo_status == "completed":
                    WorkOrderComment.objects.create(
                        work_order=wo,
                        author=manager,
                        content="Work completed and verified by management. Resident/area inspected and issue resolved satisfactorily.",
                        is_internal=False,
                    )
                if wo_status == "acknowledged":
                    WorkOrderComment.objects.create(
                        work_order=wo,
                        author=manager,
                        content="Request received and acknowledged. Obtaining quotes from approved vendors.",
                        is_internal=True,
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

        # ─── Document Categories (10) ──────────────────────────────
        doc_cats = []
        doc_cat_data = [
            ("Governing Documents", 1),
            ("Financial Reports", 2),
            ("Meeting Minutes", 3),
            ("Forms & Applications", 4),
            ("Policies & Procedures", 5),
            ("Insurance Certificates", 6),
            ("Vendor Contracts", 7),
            ("Legal Documents", 8),
            ("Newsletters", 9),
            ("Community Maps/Plans", 10),
        ]
        for name, sort in doc_cat_data:
            dc, _ = DocumentCategory.objects.get_or_create(
                community=community, name=name,
                defaults={"sort_order": sort},
            )
            doc_cats.append(dc)

        # Helper to find doc category by name
        def get_doc_cat(name):
            for dc in doc_cats:
                if dc.name == name:
                    return dc
            return doc_cats[0]

        # ─── Documents (25+) ──────────────────────────────────────
        doc_data = [
            # Governing Documents
            ("CC&Rs — Oakwood Estates", "ccr", "Governing Documents", True, "Declaration of Covenants, Conditions & Restrictions recorded with Stamford Town Clerk."),
            ("Bylaws", "bylaws", "Governing Documents", True, "Corporate bylaws governing the operation of the Oakwood Estates Homeowners Association."),
            ("Rules & Regulations", "rules", "Governing Documents", True, "Community rules and regulations adopted by the Board of Directors, effective January 2024."),
            ("Architectural Review Guidelines", "rules", "Governing Documents", True, "Comprehensive guidelines for exterior modifications, additions, and improvements requiring ARB approval."),
            # Financial Reports
            ("Annual Budget 2026", "financial", "Financial Reports", True, "Board-approved operating budget for fiscal year 2026. Includes line-item detail and reserve funding plan."),
            ("Monthly Financial Statement — February 2026", "financial", "Financial Reports", False, "Income statement, balance sheet, and accounts receivable aging report for February 2026."),
            ("Monthly Financial Statement — January 2026", "financial", "Financial Reports", False, "Income statement, balance sheet, and accounts receivable aging report for January 2026."),
            ("Reserve Study 2024", "financial", "Financial Reports", True, "Professional reserve study conducted by Reserve Advisors LLC. 30-year funding plan included."),
            ("2025 Year-End Financial Report", "financial", "Financial Reports", True, "Audited year-end financial statements prepared by Elm City Accounting."),
            # Meeting Minutes
            ("Board Meeting Minutes — January 2026", "minutes", "Meeting Minutes", True, "Approved minutes from the January 15, 2026 regular board meeting."),
            ("Board Meeting Minutes — February 2026", "minutes", "Meeting Minutes", True, "Approved minutes from the February 19, 2026 regular board meeting."),
            ("Annual Meeting Minutes — March 2026", "minutes", "Meeting Minutes", True, "Minutes from the March 8, 2026 annual homeowner meeting including election results."),
            ("Board Meeting Minutes — April 2026", "minutes", "Meeting Minutes", True, "Approved minutes from the April 16, 2026 regular board meeting."),
            # Forms & Applications
            ("Architectural Review Application", "form", "Forms & Applications", True, "Submit this form with plans and specifications for any exterior modification requiring ARB approval."),
            ("Maintenance Request Form", "form", "Forms & Applications", True, "Use this form to report maintenance issues in your unit or common areas."),
            ("Move-In/Move-Out Checklist", "form", "Forms & Applications", True, "Required checklist for all move-in and move-out activities. Includes elevator reservation and deposit info."),
            ("Pool Key Request Form", "form", "Forms & Applications", True, "Request form for pool access key/fob. Requires signed pool rules acknowledgment."),
            ("Parking Permit Application", "form", "Forms & Applications", True, "Application for resident and guest parking permits. Includes vehicle registration requirements."),
            ("Complaint/Concern Form", "form", "Forms & Applications", True, "Formal complaint submission form for violations, neighbor disputes, or community concerns."),
            # Insurance Certificates
            ("Certificate of Liability Insurance 2026", "other", "Insurance Certificates", False, "General liability insurance certificate from Hartford Insurance Group. Policy period: 1/1/2026 - 1/1/2027."),
            ("D&O Policy Summary 2026", "other", "Insurance Certificates", False, "Directors & Officers liability coverage summary. $2M aggregate limit."),
            # Vendor Contracts
            ("Landscaping Service Agreement — Green Thumb", "other", "Vendor Contracts", False, "Annual landscaping maintenance contract. Includes weekly mowing, seasonal plantings, and snow removal."),
            ("Pool Service Agreement — Sparkle Pool", "other", "Vendor Contracts", False, "Annual pool maintenance contract covering daily chemical testing, weekly cleaning, and equipment maintenance."),
            ("Management Agreement — Reeves Property Management", "other", "Vendor Contracts", False, "Property management services agreement. Term: 1/1/2026 - 12/31/2026 with auto-renewal."),
            # Policies & Procedures
            ("Pool Rules & Hours", "rules", "Policies & Procedures", True, "Pool operating rules, hours of operation, and guest policies. Updated for 2026 season."),
            ("Pet Policy", "rules", "Policies & Procedures", True, "Community pet policy including breed restrictions, leash requirements, and waste cleanup procedures."),
            ("Parking Policy", "rules", "Policies & Procedures", True, "Comprehensive parking regulations including assigned spaces, guest parking, and towing procedures."),
            ("New Homeowner Welcome Packet", "other", "Policies & Procedures", True, "Welcome guide for new residents covering community rules, amenities, contacts, and move-in procedures."),
            # Newsletters
            ("Community Newsletter — Spring 2026", "other", "Newsletters", True, "Quarterly newsletter covering pool opening, landscaping updates, board election results, and community events."),
            ("Community Newsletter — Winter 2025", "other", "Newsletters", True, "Quarterly newsletter covering holiday party recap, snow removal schedule, budget summary, and winter safety tips."),
            # Community Maps/Plans
            ("Community Site Map", "other", "Community Maps/Plans", True, "Overhead site plan showing building locations, parking areas, amenities, and unit numbering."),
            ("Emergency Evacuation Plan", "other", "Community Maps/Plans", True, "Building evacuation routes, assembly points, and emergency contact information for all buildings."),
        ]
        for title, dtype, cat_name, public, desc in doc_data:
            Document.objects.get_or_create(
                community=community, title=title,
                defaults={
                    "category": get_doc_cat(cat_name),
                    "document_type": dtype,
                    "description": desc,
                    "uploaded_by": secretary,
                    "is_public": public,
                    "version": "1.0",
                },
            )
        self.stdout.write(f"  Documents: {len(doc_data)}")

        # ─── ARB Requests (12) ──────────────────────────────────────
        arb_data = [
            ("Install backyard fence — 6ft cedar privacy", "fence", "approved", 3500, "Request to install 6-foot cedar privacy fence along rear property line. Natural stain finish. ARB-compliant design."),
            ("Repaint exterior — Benjamin Moore Revere Pewter", "exterior_paint", "approved_with_conditions", 2200, "Repainting all exterior trim and siding. Color: Benjamin Moore HC-172 Revere Pewter (light warm gray). Approved palette color."),
            ("Solar panel installation — 20 panel array", "solar", "under_review", 18000, "Installation of 20-panel solar array on south-facing roof. SunPower 400W panels. Includes inverter and monitoring."),
            ("Build front porch extension — covered portico", "structure", "submitted", 12000, "Extend existing front porch by 6 feet with covered portico. Matching brick columns and composite decking."),
            ("Replace garage door — carriage style", "door", "approved", 1800, "Replace existing single garage door with insulated carriage-style door. Color: Bronze. Clopay Coachman series."),
            ("New landscaping — front yard redesign", "landscaping", "approved", 4500, "Complete front yard redesign including native plantings, stone pathway, and professional-grade drip irrigation system."),
            ("Window replacement — all double-hung", "window", "approved_with_conditions", 9500, "Replace all 12 double-hung windows with Andersen 400 series. White exterior, natural interior. Low-E glass."),
            ("Roof replacement — architectural shingles", "roof", "under_review", 15000, "Full roof replacement with GAF Timberline HDZ architectural shingles. Color: Charcoal. Includes ridge vent upgrade."),
            ("Patio extension — stamped concrete", "structure", "submitted", 6800, "Extend rear patio by 200 sq ft with stamped concrete in Ashlar Slate pattern. Color: Desert Sand. Integrated LED lighting."),
            ("Install EV charging station", "other", "approved", 2500, "Install Level 2 EV charging station (ChargePoint Home Flex) in garage. 240V/50A circuit. Licensed electrician."),
            ("Replace front door — fiberglass entry", "door", "submitted", 3200, "Replace existing wood entry door with Therma-Tru fiberglass door. Style: Smooth-Star. Color: Iron Ore (dark gray)."),
            ("Deck addition — composite with railing", "structure", "denied", 22000, "Proposed 400 sq ft second-story deck with Trex composite decking. Denied: exceeds building envelope per CC&R Section 7.3."),
        ]
        arb_count = 0
        for title, ptype, arb_status, cost, desc in arb_data:
            prop = random.choice(properties)
            owner = Owner.objects.filter(property=prop, is_current=True).first()
            if owner:
                conditions_map = {
                    "approved_with_conditions": "Must use colors from the approved community palette. Work must be completed within 90 days of approval. Contractor must provide proof of insurance before work begins.",
                    "denied": "Proposal does not conform to CC&R Section 7.3 regarding building envelope restrictions. Homeowner may submit a revised application.",
                }
                _, created = ARBRequest.objects.get_or_create(
                    community=community,
                    property=prop,
                    title=title,
                    defaults={
                        "owner": owner,
                        "description": desc,
                        "project_type": ptype,
                        "estimated_cost": Decimal(str(cost)),
                        "estimated_start_date": today + timedelta(days=random.randint(14, 60)),
                        "estimated_completion_date": today + timedelta(days=random.randint(60, 150)),
                        "status": arb_status,
                        "reviewed_by": president if arb_status not in ("submitted", "under_review") else None,
                        "review_date": today - timedelta(days=random.randint(1, 30)) if arb_status not in ("submitted", "under_review") else None,
                        "conditions": conditions_map.get(arb_status, ""),
                    },
                )
                if created:
                    arb_count += 1
        self.stdout.write(f"  ARB Requests: {arb_count}")

        # ─── Announcements (14) ────────────────────────────────────
        ann_data = [
            ("Pool Season Opens Memorial Day Weekend", "normal", "all", False,
             "The community pool will open for the 2026 season on Saturday, May 23rd. Pool hours: 10 AM - 8 PM daily through Labor Day. All residents must obtain a new pool access fob from the management office. Pool rules and guest policies are posted on the community portal."),
            ("Annual Homeowner Meeting — March 8th", "important", "all", True,
             "The 2026 Annual Homeowner Meeting will be held on Saturday, March 8th at 10:00 AM in the Clubhouse. Agenda includes: Board election (3 seats), 2026 budget ratification, reserve fund update, and community improvement proposals. Proxies are available on the community portal for those unable to attend."),
            ("Street Repaving Schedule — Phase 2", "important", "owners", False,
             "Phase 2 of the community street repaving project will begin Monday, April 7th and is expected to take 2-3 weeks. Affected areas: Oakwood Drive (units 105-116) and the visitor parking lot. Alternate parking will be available in Lot D. Please move vehicles by 7 AM on workdays."),
            ("Holiday Decorations Policy Reminder", "normal", "all", False,
             "A friendly reminder that holiday decorations may be displayed no earlier than November 15th and must be removed by January 15th. Exterior lighting must be white or warm white only. Inflatable decorations are not permitted. Please review the full policy on the community portal."),
            ("Board Election Results — 2026", "important", "all", True,
             "Congratulations to the newly elected Board of Directors: Margaret Chen (President), Robert Williams (Treasurer), and James Patterson (At-Large). Thank you to all candidates and to the 78% of homeowners who participated in this year's election."),
            ("Water Main Repair — Temporary Shutoff March 30", "urgent", "all", True,
             "NOTICE: The City of Stamford will be performing emergency water main repairs on Oakwood Drive on Wednesday, March 30th. Water service will be interrupted from 9 AM to approximately 3 PM. Please store water for essential needs. Affected units: 100-116."),
            ("Speed Limit Reminder — 15 MPH", "normal", "all", False,
             "Please be reminded that the community speed limit is 15 MPH on all internal roads. We have received complaints about speeding, particularly near the playground and pool areas. Speed bumps are being considered if the issue persists. Please drive safely."),
            ("Gate Access Code Change — Effective April 1", "important", "all", True,
             "The community gate access code will be updated on April 1st. New codes will be distributed via email to all registered homeowners. If you have not updated your email on file, please contact the management office. Do not share the gate code with non-residents."),
            ("Community BBQ & Social — June 14th", "normal", "all", False,
             "Join your neighbors for the annual Summer Kickoff BBQ on Saturday, June 14th from 12-4 PM at the BBQ Pavilion! Burgers, hot dogs, and drinks provided. Please bring a side dish or dessert to share. RSVP on the community portal by June 7th."),
            ("Garbage Collection Schedule Change", "normal", "all", False,
             "Starting April 1st, our trash and recycling collection schedule will change. Trash pickup: Monday and Thursday. Recycling pickup: Wednesday. Bins must be placed curbside by 7 AM on collection days and returned to your garage or screened area by 8 PM the same day."),
            ("Landscaping Season Begins April 1", "normal", "all", False,
             "Spring landscaping services will begin the week of April 1st. Green Thumb Landscaping will be performing spring cleanup, mulch installation, and initial mowing. Please remove personal items from lawn areas. Irrigation system activation is scheduled for the week of April 7th."),
            ("Board Meeting Schedule — 2026", "normal", "board", False,
             "Board meetings are held the third Wednesday of each month at 7:00 PM in the Clubhouse, except July and December. All meetings are open to homeowners. The next meeting is scheduled for the upcoming month. Agenda items must be submitted 10 days prior."),
            ("Pest Control Treatment Schedule", "normal", "all", False,
             "Precision Pest Control will be performing quarterly perimeter treatment of all buildings on Tuesday, April 8th between 8 AM and 2 PM. If you have concerns about specific pest issues inside your unit, please submit a maintenance request through the portal."),
            ("Annual Fire Safety Inspection — April 15", "important", "all", False,
             "The Stamford Fire Marshal's office will conduct annual fire safety inspections of all common areas on Tuesday, April 15th. Building access will be required. Please ensure hallways and stairwells are clear of personal belongings. Smoke detector checks in individual units are recommended."),
        ]
        for title, priority, audience, pinned, content in ann_data:
            Announcement.objects.get_or_create(
                community=community,
                title=title,
                defaults={
                    "content": content,
                    "priority": priority,
                    "target_audience": audience,
                    "is_pinned": pinned,
                    "published_date": timezone.now() - timedelta(days=random.randint(1, 60)),
                    "created_by": random.choice([president, manager, secretary]),
                },
            )
        self.stdout.write(f"  Announcements: {len(ann_data)}")

        # ─── Emergency Alerts (3) ──────────────────────────────────
        alert_data = [
            ("Water Main Break — Oakwood Drive", "water",
             "EMERGENCY: A water main break has been reported on Oakwood Drive near unit 108. The City of Stamford water department has been notified and is en route. Please avoid the area and do not use water until further notice. Updates will follow."),
            ("Severe Thunderstorm Warning", "weather",
             "The National Weather Service has issued a Severe Thunderstorm Warning for Fairfield County until 9:00 PM. Damaging winds up to 70 mph and large hail possible. Please secure outdoor furniture and move vehicles away from trees. Seek shelter indoors immediately."),
            ("Suspicious Activity — Parking Lot C", "security",
             "Security has been notified of suspicious activity in Parking Lot C at approximately 11:45 PM. Stamford Police have been contacted and are responding. Please lock your vehicles and report any unusual activity to SafeGuard Security at (203) 555-0306 or call 911."),
        ]
        for title, alert_type, message in alert_data:
            EmergencyAlert.objects.get_or_create(
                community=community,
                title=title,
                defaults={
                    "message": message,
                    "alert_type": alert_type,
                    "sent_by": manager,
                    "is_active": False,  # Past alerts, resolved
                },
            )
        self.stdout.write(f"  Emergency Alerts: {len(alert_data)}")

        # ─── Amenities (11) ──────────────────────────────────────
        amenity_data = [
            ("Community Pool", "Olympic-sized heated pool with 6 lap lanes and separate children's wading area. Open Memorial Day through Labor Day.", "Pool Area", 50, True, 4, Decimal("50.00"),
             "No lifeguard on duty — swim at your own risk. Children under 12 must be accompanied by an adult. No glass containers. Pool hours: 10 AM - 8 PM daily. Guest limit: 4 per household."),
            ("Clubhouse / Event Center", "2,500 sq ft event space with commercial kitchen, AV system, and seating for 80. Perfect for parties, meetings, and community events.", "Main Building", 80, True, 8, Decimal("150.00"),
             "Available for reservation 7 days/week, 9 AM - 11 PM. $150 refundable security deposit required. Renter responsible for cleanup. No amplified music after 10 PM."),
            ("Tennis Courts", "Two regulation-size tennis courts with LED lighting for evening play. First-come-first-served, or reserve via the portal.", "Sports Area", 4, True, 2, None,
             "Court shoes required — no black-soled shoes. Maximum 2-hour sessions when others are waiting. Lights shut off automatically at 10 PM."),
            ("Fitness Center", "Full gym with 6 cardio machines (treadmills, ellipticals, bikes), free weights to 75 lbs, cable machine, and stretching area.", "Main Building — Lower Level", 20, False, 0, None,
             "Open 24/7 with key fob access. Wipe down equipment after use. No personal trainers or classes without board approval. Report broken equipment immediately."),
            ("Playground", "Children's play area with commercial-grade climbing structure, swings (2 belt, 2 bucket), slide, and rubber safety surfacing.", "Park Area — East Side", None, False, 0, None,
             "Designed for children ages 2-12. Adult supervision required for children under 8. No food or beverages on play structures. Report any damage to management."),
            ("BBQ / Picnic Pavilion", "Covered 30x20 pavilion with 3 natural gas grills, 4 picnic tables, string lighting, and adjacent lawn area.", "Park Area — Central", 30, True, 4, Decimal("25.00"),
             "Grills must be turned off after use. All food waste must be disposed of in bear-proof containers. Pavilion must be vacated by 10 PM. Clean all surfaces after use."),
            ("Basketball Court", "Full-size outdoor basketball court with adjustable hoops, LED lighting, and spectator bench seating.", "Sports Area — North", 10, False, 0, None,
             "Open dawn to dusk. No organized leagues without board approval. Court lights available until 9 PM. Please be mindful of noise near residential units."),
            ("Dog Park", "Fenced off-leash dog park with separate small dog (under 25 lbs) and large dog areas. Includes waste stations and water fountain.", "Park Area — West Side", None, False, 0, None,
             "Dogs must be current on vaccinations. Aggressive dogs must be removed immediately. Owners must pick up waste. No more than 2 dogs per handler. Children under 10 not permitted without adult."),
            ("Business Center / Conference Room", "Professional meeting space with 10-seat conference table, 65-inch display, video conferencing, and Wi-Fi.", "Main Building — Suite 102", 10, True, 4, None,
             "Available Monday-Friday, 8 AM - 8 PM and weekends 10 AM - 5 PM. 4-hour maximum reservation. No food or beverages near electronics. Please leave room as you found it."),
            ("Walking Trail", "1.2-mile paved walking/jogging trail winding through community green spaces with rest benches and distance markers.", "Community Perimeter", None, False, 0, None,
             "Trail is open dawn to dusk. Leashed dogs welcome. Cyclists must yield to pedestrians. Trail is not cleared of snow — use at your own risk in winter."),
            ("Community Garden", "24 individual 4x8 raised garden plots available for rent. Includes shared tool shed, compost area, and water spigots.", "Park Area — South Side", 24, True, 12, Decimal("75.00"),
             "Annual plot rental: $75/year (April-October). Plots must be actively maintained. No pesticides — organic methods only. Harvest only from your assigned plot."),
        ]
        amenities = []
        for name, desc, loc, cap, requires_res, max_hrs, deposit, rules in amenity_data:
            a, _ = Amenity.objects.get_or_create(
                community=community, name=name,
                defaults={
                    "description": desc,
                    "location": loc,
                    "capacity": cap,
                    "requires_reservation": requires_res,
                    "reservation_max_hours": max_hrs or 4,
                    "deposit_amount": deposit,
                    "rules": rules,
                    "is_active": True,
                },
            )
            amenities.append(a)

        # Add reservations
        reservation_data = [
            ("Birthday party for my daughter — 15 kids", 15, "approved"),
            ("Family reunion BBQ", 25, "approved"),
            ("Saturday morning swim practice for kids", 8, "approved"),
            ("HOA social committee event", 40, "approved"),
            ("Tennis doubles match", 4, "approved"),
            ("Book club meeting", 8, "approved"),
            ("Neighborhood watch planning meeting", 12, "pending"),
            ("4th of July cookout", 30, "pending"),
        ]
        res_count = 0
        for purpose, guests, status in reservation_data:
            reservable = [a for a in amenities if a.requires_reservation]
            if reservable:
                amenity = random.choice(reservable)
                start = timezone.now() + timedelta(days=random.randint(1, 45), hours=random.randint(10, 16))
                _, created = Reservation.objects.get_or_create(
                    community=community,
                    amenity=amenity,
                    reserved_by=random.choice(residents),
                    start_datetime=start,
                    defaults={
                        "property": random.choice(properties),
                        "end_datetime": start + timedelta(hours=amenity.reservation_max_hours),
                        "guest_count": guests,
                        "purpose": purpose,
                        "status": status,
                        "deposit_paid": amenity.deposit_amount is not None and status == "approved",
                    },
                )
                if created:
                    res_count += 1
        self.stdout.write(f"  Amenities: {len(amenities)} with {res_count} reservations")

        # ─── Expenses (30+) ──────────────────────────────────────
        expense_data = [
            ("Monthly landscaping service — March", "Landscaping & Grounds", "Green Thumb Landscaping", 4333),
            ("Monthly landscaping service — February", "Landscaping & Grounds", "Green Thumb Landscaping", 4333),
            ("Monthly landscaping service — January", "Landscaping & Grounds", "Green Thumb Landscaping", 4333),
            ("Pool opening preparation & chemical treatment", "Pool Maintenance", "Sparkle Pool Service", 2800),
            ("Monthly pool maintenance — February", "Pool Maintenance", "Sparkle Pool Service", 1200),
            ("Quarterly pest control — perimeter treatment", "Pest Control", "Precision Pest Control", 950),
            ("Elevator annual inspection & maintenance", "Elevator Maintenance", None, 3600),
            ("Fire extinguisher inspection — all buildings", "Fire Safety", "Summit Fire Protection", 1250),
            ("Security camera system maintenance", "Security & Access", "SafeGuard Security", 875),
            ("Monthly management fee — March", "Management Fees", None, 5000),
            ("Monthly management fee — February", "Management Fees", None, 5000),
            ("Monthly management fee — January", "Management Fees", None, 5000),
            ("Annual audit — 2025 fiscal year", "Accounting & Audit", None, 4200),
            ("Tax preparation — 2025 filing", "Tax Preparation", None, 1750),
            ("Snow removal — January storms (3 events)", "Snow Removal", "Green Thumb Landscaping", 4500),
            ("Snow removal — February storms (2 events)", "Snow Removal", "Green Thumb Landscaping", 3000),
            ("Parking lot crack sealing & striping", "Paving/Concrete", "Granite State Paving", 6800),
            ("Clubhouse HVAC quarterly service", "Building Maintenance", "Comfort HVAC Solutions", 425),
            ("Office supplies & postage", "Administrative/Office", None, 285),
            ("Community website hosting — annual", "Website/Software", "TechConnect IT", 1200),
            ("Liability insurance — quarterly premium", "Insurance (Liability)", "Hartford Insurance Group", 3500),
            ("Property insurance — quarterly premium", "Insurance (Property)", "Hartford Insurance Group", 7000),
            ("D&O insurance — annual premium", "Insurance (D&O)", "Hartford Insurance Group", 6500),
            ("Electric utility — common areas — February", "Utilities (Electric)", None, 1520),
            ("Water/sewer — common areas — February", "Utilities (Water/Sewer)", None, 1840),
            ("Gas utility — common areas — February", "Utilities (Gas)", None, 980),
            ("Cable/internet — clubhouse & office", "Utilities (Cable/Internet)", None, 399),
            ("Trash removal — monthly service — February", "Trash Removal", None, 1200),
            ("Plumbing repair — clubhouse restroom", "Common Area Repairs", "Premier Plumbing", 475),
            ("Replace broken hallway light fixtures — Bldg A", "Common Area Repairs", "Bright Electric", 680),
            ("Legal consultation — CC&R amendment review", "Legal & Professional", "Elm City Legal", 1500),
            ("Spring social event supplies", "Social Events", None, 450),
            ("Reserve fund contribution — March", "Reserve Contribution", None, 10000),
        ]
        expense_count = 0
        for desc, cat_name, vendor_name, amount in expense_data:
            # Find matching category
            cat = None
            for ec in expense_cats:
                if ec.name == cat_name:
                    cat = ec
                    break
            if not cat:
                cat = random.choice(expense_cats)

            # Find matching vendor
            vendor = None
            if vendor_name:
                for v in vendors:
                    if v.name == vendor_name:
                        vendor = v
                        break

            _, created = Expense.objects.get_or_create(
                community=community,
                description=desc,
                expense_date=today - timedelta(days=random.randint(1, 90)),
                defaults={
                    "vendor": vendor,
                    "category": cat,
                    "amount": Decimal(str(amount)),
                    "status": random.choice(["approved", "paid", "paid", "paid"]),
                    "approved_by": treasurer,
                },
            )
            if created:
                expense_count += 1
        self.stdout.write(f"  Expenses: {expense_count}")

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
