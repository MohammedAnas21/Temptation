# Temptations Cafe — Digital Experience Platform

Production-grade hospitality platform for Temptations Cafe, Kalaburagi.

## Platform Overview

| Surface | Tech | Port |
|---------|------|------|
| Customer Website | Next.js 15 + Tailwind + Shadcn | 3000 |
| Admin + Staff Dashboard | Next.js 15 + Recharts | 3001 |
| Mobile App (Android + iOS) | Flutter + Riverpod | — |
| Backend API | FastAPI + PostgreSQL | 8000 |

## Quick Start (Local Development)

### Prerequisites
- Docker + Docker Compose
- Node.js 20+
- Python 3.12+
- Flutter 3.19+

### 1. Clone and configure environment
```bash
cd platform/apps/api
cp .env.example .env
# Fill in your Firebase, PhonePe, WhatsApp, Supabase credentials
```

### 2. Start all services
```bash
cd platform/infra
docker compose up -d
```
This starts: PostgreSQL (5432), Redis (6379), FastAPI API (8000), Adminer (8080).

### 3. Run database migrations + seed
```bash
cd platform/apps/api
pip install -r requirements.txt
alembic upgrade head
```

### 4. Start the customer website
```bash
cd platform/apps/web
npm install
npm run dev   # http://localhost:3000
```

### 5. Start the admin dashboard
```bash
cd platform/apps/admin
npm install
npm run dev   # http://localhost:3001
```

### 6. Run the Flutter app
```bash
cd platform/apps/mobile
flutter pub get
flutter run
```

## Project Structure

```
platform/
├── apps/
│   ├── api/          # FastAPI backend
│   ├── web/          # Next.js customer website
│   ├── admin/        # Next.js admin + staff dashboard
│   └── mobile/       # Flutter mobile app
├── infra/
│   ├── docker-compose.yml       # Development
│   ├── docker-compose.prod.yml  # Production
│   └── nginx/nginx.conf
├── .github/
│   └── workflows/
│       ├── test.yml    # CI: run tests on PR
│       └── deploy.yml  # CD: deploy on merge to main
└── docs/
    ├── DEPLOYMENT.md
    ├── TESTING.md
    └── ARCHITECTURE.md
```

## API Documentation
Once running: http://localhost:8000/docs (Swagger UI)

## Running Tests
```bash
cd platform/apps/api
pytest tests/ -v
```

## Environment Variables
See `apps/api/.env.example` for all required configuration keys.
