# System Architecture

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Customer Website │  │  Flutter App     │  │  Admin Dashboard │  │
│  │  Next.js 15       │  │  Android + iOS   │  │  Next.js 15      │  │
│  │  temptationscafe.in│  │  Firebase Auth  │  │  admin.tempt…in  │  │
│  └────────┬──────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼─────────────────────┼──────────────────────┼────────────┘
            │                     │                       │
            └─────────────────────▼───────────────────────┘
                         HTTPS / REST JSON
                                  │
                   ┌──────────────▼──────────────┐
                   │      FastAPI (v1)             │
                   │  • Firebase JWT verify        │
                   │  • RBAC (5 roles)             │
                   │  • Rate limiting (Redis)      │
                   │  • Audit logging              │
                   │  • Swagger /docs              │
                   └──────────────┬───────────────┘
         ┌────────────────────────┼───────────────────────┐
         ▼                        ▼                        ▼
  ┌─────────────┐       ┌─────────────────┐    ┌──────────────────┐
  │ PostgreSQL  │       │  Firebase Auth   │    │ Supabase Storage │
  │ (primary DB)│       │  (JWT tokens)    │    │ (images, files)  │
  └─────────────┘       └─────────────────┘    └──────────────────┘
         │
  ┌──────▼──────┐
  │    Redis    │
  │ (rate limit)│
  └─────────────┘

External Integrations:
  ┌──────────────┐  ┌──────────────────┐  ┌─────────────┐
  │   PhonePe    │  │ WhatsApp Business│  │     FCM     │
  │  (payments)  │  │   (messaging)    │  │  (push notif│
  └──────────────┘  └──────────────────┘  └─────────────┘
```

## Data Flow: Reservation Confirmed

```
Customer App
  → POST /reservations (Firebase JWT)
  → FastAPI validates token, checks table availability
  → Creates Reservation record (status=confirmed)
  → Marks CafeTable.status = reserved
  → automation.on_reservation_confirmed():
      → WhatsApp API: send template message
      → FCM: send push notification
  → Returns reservation details

Staff App (30s polling)
  → GET /tables → sees table as "reserved"
  → PATCH /reservations/{id}/status {checked_in}
  → CafeTable.status = occupied
  → loyalty: +50 points awarded on checkout
```

## Data Flow: Payment Success (PhonePe Webhook)

```
PhonePe → POST /webhooks/phonepe
  → HMAC signature verified
  → Find Payment by gateway_txn_id
  → Idempotency check (skip if already processed)
  → Update Payment.status = success
  → Update Order.payment_status = paid, status = confirmed
     OR Reservation.deposit_paid = true
  → Log PaymentEvent
  → Send FCM push to customer
  → Return 200 OK
```

## RBAC Matrix

| Resource | Customer | Staff | Manager | Admin | Super Admin |
|----------|----------|-------|---------|-------|-------------|
| Menu (read) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Menu (write) | ✗ | ✗ | ✗ | ✓ | ✓ |
| Own Orders | ✓ | ✓ | ✓ | ✓ | ✓ |
| All Orders | ✗ | ✓ | ✓ | ✓ | ✓ |
| Own Reservations | ✓ | ✓ | ✓ | ✓ | ✓ |
| All Reservations | ✗ | ✓ | ✓ | ✓ | ✓ |
| Table Status | ✗ | ✓ | ✓ | ✓ | ✓ |
| CRM | ✗ | ✗ | ✓ | ✓ | ✓ |
| Analytics | ✗ | ✗ | ✓ | ✓ | ✓ |
| Campaigns | ✗ | ✗ | ✓ | ✓ | ✓ |
| Staff Mgmt | ✗ | ✗ | ✗ | ✓ | ✓ |
| Branch Config | ✗ | ✗ | ✗ | ✗ | ✓ |

## Database Entity Relationships (key)

```
branches ──< users
branches ──< cafe_tables
branches ──< menu_categories ──< menu_items
branches ──< orders ──< order_items >── menu_items
branches ──< reservations >── cafe_tables
users ──── loyalty_accounts ──< loyalty_transactions
users ──< referrals
coupons ──< coupon_redemptions
campaigns ──< campaign_recipients >── users
payments ──< payment_events
```

## API Versioning
All endpoints prefixed `/api/v1/`. Breaking changes increment to `/api/v2/`.

## Security Layers
1. HTTPS only (Nginx terminates TLS)
2. Firebase JWT on every protected route
3. RBAC middleware — role checked per endpoint
4. Rate limiting — Redis token bucket (100/min auth, 20/min public)
5. PhonePe webhook — SHA-256 HMAC signature
6. CORS — restricted to known origins
7. Audit log — all write operations logged
8. SQL injection prevention — SQLAlchemy ORM (parameterized)
9. Input validation — Pydantic v2 on all request bodies
