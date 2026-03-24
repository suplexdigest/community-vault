# CommunityVault — HOA Management Platform

Multi-tenant HOA management SaaS. Django 5 + DRF backend, React 19 + MUI 7 + Vite frontend.

## Commands

```bash
# Backend
cd backend && source venv/Scripts/activate
DJANGO_DEBUG=True python manage.py runserver 0.0.0.0:8000
python manage.py test
python manage.py makemigrations
python manage.py migrate
python manage.py seed_demo          # Full demo environment
python manage.py seed_demo --reset  # Reset and re-seed
python manage.py send_reminders     # Send email/SMS reminders (cron daily)

# Frontend
cd frontend && npm run dev          # Vite dev server (port 5173)
npm run build                       # Production build
npm run lint
```

## Architecture

- **12 Django apps**: core, properties, finances, violations, maintenance, meetings, documents, architectural, communications, amenities, reports, notifications
- **50+ lazy-loaded React pages** with role-based access
- **Multi-tenant**: Each HOA community is a tenant. X-Community-Id header on every API call.
- **JWT auth**: 60-min access tokens, 7-day refresh. 2FA via pyotp.
- **Role hierarchy**: resident(0) < board_member(1) < treasurer(2) < secretary(3) < president(4) < manager(5) < admin(6)
- **Notifications**: Email (SMTP) + SMS (Twilio) reminders for assessments, meetings, violations, work orders

## Key Patterns

- All querysets filter by `community_id` from X-Community-Id header (tenant isolation)
- Frontend sends X-Community-Id header on every API call via axios interceptor
- Feature gating: `community.features` (JSONField) controls what each HOA sees
- Role-based permissions in `core/permissions.py`
- Color scheme: Forest green (#1B4332) + gold (#C5A258)

## Demo Data

Run `python manage.py seed_demo` to create:
- Oakwood Estates HOA (150 units, 17 populated)
- 19 users across all roles (password: Demo2024!)
- Assessments, payments, violations, work orders, meetings, documents, ARB requests, amenities

## Deployment

- **Railway** via Dockerfile (multi-stage: Node build → Python runtime)
- PostgreSQL in production, SQLite in development
- Push to main triggers auto-deploy
