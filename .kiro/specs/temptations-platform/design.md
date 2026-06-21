# Temptations Cafe Digital Experience Platform — Design

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Customer Web │  │  Mobile App  │  │ Admin / Staff Dash   │  │
│  │  (Next.js)   │  │  (Flutter)   │  │     (Next.js)        │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼─────────────────┼──────────────────────┼─────────────┘
          │                 │                       │
          └─────────────────▼───────────────────────┘
                            │  HTTPS / REST
                   ┌────────▼────────┐
                   │  FastAPI (v1)   │
                   │  + RBAC + JWT   │
                   └────────┬────────┘
          ┌─────────────────┼──────────────────────┐
          ▼                 ▼                       ▼
   ┌─────────────┐  ┌──────────────┐     ┌─────────────────┐
   │ PostgreSQL  │  │Firebase Auth │     │Supabase Storage │
   └─────────────┘  └──────────────┘     └─────────────────┘
          │
   ┌──────▼───────┐
   │    Redis     │  (rate limiting, session cache)
   └──────────────┘

External Services:
  PhonePe Gateway · WhatsApp Business API · FCM · Google Maps
```

---

## 2. Folder Structure

### 2.1 Monorepo Root
```
temptations-platform/
├── apps/
│   ├── web/                  # Next.js customer website
│   ├── admin/                # Next.js admin + staff dashboard
│   ├── mobile/               # Flutter app
│   └── api/                  # FastAPI backend
├── packages/
│   └── shared-types/         # Shared TypeScript types (web + admin)
├── infra/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── nginx/
├── .github/
│   └── workflows/            # CI/CD pipelines
└── docs/                     # Architecture and API docs
```

### 2.2 FastAPI Backend (`apps/api/`)
```
api/
├── app/
│   ├── main.py               # FastAPI app factory
│   ├── config.py             # Settings (pydantic-settings)
│   ├── database.py           # SQLAlchemy async engine
│   ├── dependencies.py       # Shared DI (auth, db session)
│   ├── middleware/
│   │   ├── auth.py           # JWT / Firebase token verify
│   │   ├── rbac.py           # Role-based access control
│   │   ├── rate_limit.py     # Redis-backed rate limiter
│   │   └── audit.py          # Audit log interceptor
│   ├── models/               # SQLAlchemy ORM models
│   ├── schemas/              # Pydantic v2 request/response schemas
│   ├── routers/              # One router file per domain
│   ├── services/             # Business logic layer
│   ├── repositories/         # DB query layer
│   ├── integrations/
│   │   ├── firebase.py
│   │   ├── phonepe.py
│   │   ├── whatsapp.py
│   │   ├── fcm.py
│   │   └── supabase.py
│   └── utils/
├── migrations/               # Alembic migrations
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── Dockerfile
├── requirements.txt
└── alembic.ini
```

### 2.3 Next.js Customer Website (`apps/web/`)
```
web/
├── app/                      # App Router
│   ├── (marketing)/          # Public pages group
│   │   ├── page.tsx          # Homepage
│   │   ├── about/
│   │   ├── menu/
│   │   ├── gallery/
│   │   ├── events/
│   │   ├── offers/
│   │   ├── reservations/
│   │   ├── contact/
│   │   └── blog/
│   ├── api/                  # Route handlers
│   └── layout.tsx
├── components/
│   ├── ui/                   # Shadcn UI components
│   ├── sections/             # Page sections (Hero, Menu, etc.)
│   └── shared/               # Shared components
├── lib/
│   ├── api.ts                # API client
│   └── seo.ts                # SEO helpers
├── public/
└── next.config.ts
```

### 2.4 Next.js Admin Dashboard (`apps/admin/`)
```
admin/
├── app/
│   ├── (auth)/               # Login
│   └── (dashboard)/
│       ├── layout.tsx        # Sidebar + nav
│       ├── page.tsx          # Overview
│       ├── reservations/
│       ├── tables/
│       ├── orders/
│       ├── customers/
│       ├── menu/
│       ├── offers/
│       ├── campaigns/
│       ├── payments/
│       ├── analytics/
│       ├── staff/
│       └── settings/
│           ├── staff/        # Staff dashboard view
│           └── roles/
├── components/
└── lib/
```

### 2.5 Flutter Mobile App (`apps/mobile/`)
```
mobile/
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── network/          # Dio client + interceptors
│   │   ├── router/           # GoRouter
│   │   └── theme/            # Brand theme (colors, typography)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   ├── home/
│   │   ├── menu/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── reservations/
│   │   ├── loyalty/
│   │   ├── profile/
│   │   ├── offers/
│   │   └── notifications/
│   └── shared/
│       ├── widgets/
│       └── providers/        # Riverpod providers
├── assets/
├── test/
└── pubspec.yaml
```

---

## 3. Database Schema Design

### 3.1 Core Tables

```sql
-- Branches (multi-branch ready)
branches (id, name, address, city, phone, email, is_active, created_at, updated_at)

-- Users (all roles — synced from Firebase)
users (
  id UUID PK,
  firebase_uid VARCHAR UNIQUE NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  name VARCHAR,
  role ENUM('customer','staff','manager','admin','super_admin'),
  branch_id UUID FK branches,
  avatar_url TEXT,
  birthday DATE,
  anniversary DATE,
  referral_code VARCHAR(8) UNIQUE,
  referred_by UUID FK users,
  is_active BOOL DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Tables
cafe_tables (
  id UUID PK,
  branch_id UUID FK,
  table_number INT,
  table_type ENUM('standard','dining','premium_sofa','private_sofa'),
  capacity INT,
  status ENUM('available','reserved','occupied','cleaning','out_of_service'),
  position_x INT,   -- for visual layout
  position_y INT,
  updated_at TIMESTAMPTZ
)

-- Menu Categories
menu_categories (id, branch_id, name, slug, image_url, display_order, is_active, created_at, updated_at)

-- Menu Items
menu_items (
  id UUID PK,
  branch_id UUID FK,
  category_id UUID FK,
  name VARCHAR,
  description TEXT,
  price NUMERIC(10,2),
  image_url TEXT,
  is_veg BOOL,
  ingredients TEXT[],
  preparation_time INT,   -- minutes
  is_available BOOL,
  is_best_seller BOOL,
  is_recommended BOOL,
  is_chef_special BOOL,
  sort_order INT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### 3.2 Orders
```sql
orders (
  id UUID PK,
  branch_id UUID FK,
  customer_id UUID FK users,
  table_id UUID FK cafe_tables NULLABLE,
  order_type ENUM('dine_in','takeaway'),
  status ENUM('pending','confirmed','preparing','ready','delivered','cancelled'),
  subtotal NUMERIC(10,2),
  discount_amount NUMERIC(10,2) DEFAULT 0,
  points_redeemed INT DEFAULT 0,
  total_amount NUMERIC(10,2),
  payment_method ENUM('phonepe','upi','cash'),
  payment_status ENUM('pending','paid','failed','refunded'),
  coupon_id UUID FK coupons NULLABLE,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

order_items (
  id UUID PK,
  order_id UUID FK,
  menu_item_id UUID FK,
  quantity INT,
  unit_price NUMERIC(10,2),
  addons JSONB,
  notes TEXT
)

order_status_history (id, order_id, status, changed_by UUID FK users, created_at)
```

### 3.3 Reservations
```sql
reservations (
  id UUID PK,
  branch_id UUID FK,
  customer_id UUID FK users,
  table_id UUID FK cafe_tables,
  reservation_date DATE,
  reservation_time TIME,
  guest_count INT,
  seating_type ENUM('standard','dining','premium_sofa','private_sofa'),
  status ENUM('pending','confirmed','checked_in','checked_out','cancelled','no_show'),
  deposit_amount NUMERIC(10,2) DEFAULT 200,
  deposit_paid BOOL DEFAULT false,
  payment_id UUID FK payments NULLABLE,
  special_requests TEXT,
  whatsapp_sent BOOL DEFAULT false,
  push_sent BOOL DEFAULT false,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

reservation_status_history (id, reservation_id, status, changed_by UUID FK users, created_at)
```

### 3.4 Loyalty & CRM
```sql
loyalty_accounts (
  id UUID PK,
  user_id UUID FK UNIQUE,
  points_balance INT DEFAULT 0,
  lifetime_points INT DEFAULT 0,
  tier ENUM('bronze','silver','gold') DEFAULT 'bronze',
  updated_at TIMESTAMPTZ
)

loyalty_transactions (
  id UUID PK,
  user_id UUID FK,
  type ENUM('earn','redeem','referral','birthday','anniversary','manual'),
  points INT,  -- positive=earn, negative=redeem
  reference_id UUID,  -- order_id or reservation_id
  description TEXT,
  created_at TIMESTAMPTZ
)

loyalty_tiers (
  id UUID PK,
  name VARCHAR,
  min_points INT,
  max_points INT,
  earn_multiplier NUMERIC(3,2),
  benefits JSONB
)

referrals (
  id UUID PK,
  referrer_id UUID FK users,
  referred_id UUID FK users,
  status ENUM('pending','rewarded'),
  created_at TIMESTAMPTZ
)
```

### 3.5 Payments
```sql
payments (
  id UUID PK,
  branch_id UUID FK,
  user_id UUID FK,
  reference_type ENUM('order','reservation'),
  reference_id UUID,
  amount NUMERIC(10,2),
  method ENUM('phonepe','upi','cash'),
  status ENUM('pending','success','failed','refunded'),
  gateway_txn_id VARCHAR,
  gateway_response JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

payment_events (id, payment_id, event_type, payload JSONB, created_at)
```

### 3.6 Marketing
```sql
coupons (
  id UUID PK,
  code VARCHAR(20) UNIQUE,
  type ENUM('percentage','flat'),
  value NUMERIC(10,2),
  min_order_value NUMERIC(10,2),
  max_discount NUMERIC(10,2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOL,
  created_at TIMESTAMPTZ
)

offers (id, title, description, image_url, valid_from, valid_until, is_active, coupon_id FK, created_at)

campaigns (
  id UUID PK,
  name VARCHAR,
  type ENUM('whatsapp','push','coupon','birthday','anniversary','referral','review'),
  audience_type ENUM('all','segment','manual'),
  segment_id UUID FK NULLABLE,
  message_template TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status ENUM('draft','scheduled','sending','sent','failed'),
  created_by UUID FK users,
  created_at TIMESTAMPTZ
)

campaign_recipients (id, campaign_id, user_id, status ENUM('pending','sent','delivered','opened','converted'), sent_at, updated_at)
```

### 3.7 Reviews & Audit
```sql
reviews (id, user_id, branch_id, order_id NULLABLE, reservation_id NULLABLE, rating INT, comment TEXT, is_google_review BOOL, created_at)

audit_logs (id, user_id, action, entity_type, entity_id, old_value JSONB, new_value JSONB, ip_address INET, created_at)
```

---

## 4. API Design

### 4.1 Authentication Flow
```
Client → Firebase SDK → Firebase Auth → ID Token (JWT)
Client → POST /api/v1/auth/verify { id_token }
API → Verify token with Firebase Admin SDK
API → Upsert user in DB, return internal JWT
Client → All subsequent requests: Authorization: Bearer <internal_jwt>
```

### 4.2 Key Endpoint Specifications

**Reservations**
```
GET    /api/v1/reservations/availability?date=&time=&guests=&branch_id=
POST   /api/v1/reservations                  (customer: create)
GET    /api/v1/reservations/{id}
PATCH  /api/v1/reservations/{id}/status      (staff: check-in, check-out, cancel)
GET    /api/v1/reservations                  (admin/staff: list with filters)
```

**Orders**
```
POST   /api/v1/orders                        (customer: place order)
GET    /api/v1/orders/{id}                   (tracking)
GET    /api/v1/orders/my                     (customer order history)
PATCH  /api/v1/orders/{id}/status            (staff: update status)
GET    /api/v1/orders                        (admin: all orders)
```

**Payments**
```
POST   /api/v1/payments/initiate             (returns PhonePe redirect URL)
POST   /api/v1/webhooks/phonepe              (PhonePe webhook, HMAC verified)
POST   /api/v1/payments/{id}/refund          (admin only)
```

**Loyalty**
```
GET    /api/v1/loyalty/me                    (balance, tier, history)
POST   /api/v1/loyalty/redeem                (apply points in cart)
```

**Analytics**
```
GET    /api/v1/analytics/revenue?period=&branch_id=
GET    /api/v1/analytics/orders?period=
GET    /api/v1/analytics/reservations?period=
GET    /api/v1/analytics/occupancy?date=
GET    /api/v1/analytics/top-customers?limit=
GET    /api/v1/analytics/popular-items?limit=
GET    /api/v1/analytics/peak-hours?period=
```

---

## 5. Automation Workflow Design

### 5.1 Reservation Created Workflow
```
Trigger: POST /reservations → status = confirmed
  ├── Send WhatsApp message (template: reservation_confirmation)
  │     Variables: {{name}}, {{date}}, {{time}}, {{guests}}, {{table}}, {{deposit}}
  ├── Send FCM push notification
  │     Title: "Reservation Confirmed!"
  │     Body: "Table for {{guests}} on {{date}} at {{time}}"
  ├── Update CRM: add reservation to customer timeline
  └── Log to analytics
```

### 5.2 Payment Success Workflow
```
Trigger: PhonePe webhook → status = SUCCESS
  ├── Update payment record → status = success
  ├── Update order/reservation → payment_status = paid, status = confirmed
  ├── Send FCM push: "Payment of ₹{{amount}} received"
  ├── Send WhatsApp receipt
  ├── Award loyalty points (orders only): floor(amount/10) points
  └── Update analytics
```

### 5.3 Post-Visit Workflow
```
Trigger: Staff marks reservation → checked_out
  ├── Award loyalty points: 50 bonus points
  ├── Schedule review request WhatsApp (+2 hours)
  ├── Schedule Google review request (+24 hours)
  └── Update CRM visit history + total spend
```

### 5.4 Birthday/Anniversary Workflow
```
Trigger: Nightly cron job at 00:00
  ├── Query users where birthday = today
  │     ├── Credit 500 loyalty points
  │     ├── Send WhatsApp birthday message
  │     └── Send FCM push: "Happy Birthday! 🎂 500 bonus points added"
  └── Query users where anniversary = today
        ├── Credit 300 loyalty points
        └── Send WhatsApp anniversary message
```

---

## 6. Security Design

### 6.1 RBAC Matrix

| Endpoint Group | CUSTOMER | STAFF | MANAGER | ADMIN | SUPER_ADMIN |
|----------------|----------|-------|---------|-------|-------------|
| Menu (read) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Menu (write) | ✗ | ✗ | ✗ | ✓ | ✓ |
| Orders (own) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Orders (all) | ✗ | ✓ | ✓ | ✓ | ✓ |
| Reservations (own) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reservations (all) | ✗ | ✓ | ✓ | ✓ | ✓ |
| Table status (write) | ✗ | ✓ | ✓ | ✓ | ✓ |
| CRM | ✗ | ✗ | ✓ | ✓ | ✓ |
| Campaigns | ✗ | ✗ | ✓ | ✓ | ✓ |
| Analytics | ✗ | ✗ | ✓ | ✓ | ✓ |
| Staff management | ✗ | ✗ | ✗ | ✓ | ✓ |
| Branch config | ✗ | ✗ | ✗ | ✗ | ✓ |

### 6.2 Webhook Security
- PhonePe webhooks verified via SHA-256 HMAC signature
- Webhook endpoint rate-limited separately
- Idempotency key on payment events to prevent duplicate processing

---

## 7. Deployment Design

### 7.1 Docker Compose (Development)
```yaml
services:
  api:       FastAPI (port 8000)
  db:        PostgreSQL 16 (port 5432)
  redis:     Redis 7 (port 6379)
  adminer:   DB admin UI (port 8080)
```

### 7.2 Production Stack
```
VPS / Cloud VM
  ├── Nginx (reverse proxy + SSL termination)
  ├── FastAPI (Gunicorn + Uvicorn workers, 4 workers)
  ├── PostgreSQL (managed, e.g. Supabase DB or RDS)
  └── Redis (managed, e.g. Upstash)

CI/CD: GitHub Actions
  on push to main:
    1. Run tests (pytest)
    2. Build Docker image
    3. Push to registry
    4. SSH deploy to VPS
    5. Run migrations (alembic upgrade head)
    6. Reload Gunicorn (zero-downtime)
```

### 7.3 Environment Variables
```
# Database
DATABASE_URL=postgresql+asyncpg://...

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# PhonePe
PHONEPE_MERCHANT_ID=
PHONEPE_SALT_KEY=
PHONEPE_SALT_INDEX=
PHONEPE_ENV=PRODUCTION

# WhatsApp
WHATSAPP_API_URL=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# FCM
FCM_SERVER_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# App
SECRET_KEY=
CORS_ORIGINS=https://temptationscafe.in,https://admin.temptationscafe.in
```
