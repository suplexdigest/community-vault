# Stage 1: Build frontend
FROM node:22-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python backend
FROM python:3.13-slim AS backend
WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend code
COPY backend/ ./

# Copy frontend build into backend for whitenoise
COPY --from=frontend-build /app/frontend/dist ./frontend-dist

# Collect static files
ENV DJANGO_DEBUG=False
ENV DJANGO_SECRET_KEY=build-time-placeholder-key-not-used-in-production-000000000000
RUN python manage.py collectstatic --noinput 2>/dev/null || true

# Reset secret key
ENV DJANGO_SECRET_KEY=""

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 4 --timeout 120"]
