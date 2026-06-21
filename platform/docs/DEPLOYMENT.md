# Deployment Guide

## Production Architecture

```
Internet → Nginx (SSL) → FastAPI (Gunicorn × 4 workers)
                       → Next.js Web  (Vercel / VPS)
                       → Next.js Admin (Vercel / VPS)
Database: PostgreSQL (Supabase or RDS)
Cache:    Redis (Upstash or self-hosted)
Storage:  Supabase Storage
Auth:     Firebase Auth
```

## Step-by-Step VPS Deployment

### 1. Server Setup (Ubuntu 22.04)
```bash
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin git nginx certbot python3-certbot-nginx
systemctl enable docker
```

### 2. Clone and configure
```bash
mkdir -p /opt/temptations
cd /opt/temptations
git clone https://github.com/your-org/temptations-platform .
cd apps/api
cp .env.example .env
# Edit .env with production credentials
nano .env
```

### 3. SSL Certificate
```bash
certbot --nginx -d api.temptationscafe.in
```

### 4. Build and start production containers
```bash
cd /opt/temptations/infra
docker compose -f docker-compose.prod.yml up -d --build
```

### 5. Run migrations
```bash
docker exec temptations_api alembic upgrade head
```

### 6. Deploy web and admin to Vercel
```bash
# Web
cd apps/web
npx vercel --prod

# Admin
cd apps/admin
npx vercel --prod
```

## CI/CD via GitHub Actions

The `deploy.yml` workflow triggers on push to `main`:
1. Builds Docker image and pushes to GitHub Container Registry
2. Runs `npm build` for web and admin
3. SSH deploys to VPS
4. Runs `alembic upgrade head` for migrations

**Required GitHub Secrets:**
- `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
- Any additional secrets for Vercel deployment

## Flutter App Release

### Android APK
```bash
cd platform/apps/mobile
flutter build apk --release --dart-define=API_BASE_URL=https://api.temptationscafe.in/api/v1
```

### iOS IPA
```bash
flutter build ios --release
# Then use Xcode to archive and submit to App Store
```

## Database Backup

Daily automated backup via pg_dump:
```bash
# Add to crontab
0 2 * * * docker exec temptations_db pg_dump -U postgres temptations | gzip > /backups/temptations_$(date +\%Y\%m\%d).sql.gz
```

Retain 30 days of backups. Upload to Supabase Storage for offsite redundancy.

## Health Monitoring

- API health: `GET https://api.temptationscafe.in/health`
- Set up UptimeRobot to ping this endpoint every 5 minutes
- Configure Sentry for error tracking: set `SENTRY_DSN` in API `.env`
