# Temptations Cafe Digital Experience Platform — Requirements

## Overview

Temptations Cafe is a premium cafe and restaurant in Kalaburagi. This document defines the full requirements for a production-grade, multi-surface hospitality platform covering customer-facing web and mobile apps, staff and admin dashboards, and a complete backend system for orders, reservations, loyalty, CRM, marketing automation, and analytics.

---

## 1. Platform Surfaces

| Surface | Technology |
|---------|-----------|
| Customer Website | Next.js, TypeScript, Tailwind CSS, Shadcn UI |
| Mobile App (Android + iOS) | Flutter, Riverpod, Clean Architecture |
| Admin Dashboard | Next.js, TypeScript, Tailwind CSS, Shadcn UI |
| Staff Dashboard | Next.js, TypeScript, Tailwind CSS, Shadcn UI |
| Backend API | FastAPI (Python) |
| Database | PostgreSQL |
| Auth | Firebase Auth |
| Storage | Supabase Storage |
| Payments | PhonePe Gateway, UPI, Cash |
| Notifications | Firebase Cloud Messaging (FCM) |
| Messaging | WhatsApp Business API |
| Maps | Google Maps |

---

## 2. User Roles

| Role | Description |
|------|-------------|
| CUSTOMER | End users who browse, order, and reserve |
| STAFF | Floor and kitchen staff; manage orders and table status |
| MANAGER | Branch-level manager; access to reports and staff |
| ADMIN | Full platform control; manage menu, offers, campaigns |
| SUPER_ADMIN | Multi-branch access; platform configuration |

---

## 3. Customer Website Requirements

### REQ-WEB-001: Homepage
- Hero section with brand imagery, tagline, and CTA buttons (Reserve, Order, Menu)
- Featured menu items carousel
- Testimonials / customer reviews section
- Gallery preview strip
- Upcoming events teaser
- Active offers / promotions banner
- Download app section with App Store and Play Store links
- Location map embed (Google Maps)
- Footer with contact info, social links, and sitemap

### REQ-WEB-002: About Page
- Cafe story and brand narrative
- Team section
- Brand values and philosophy
- Awards / recognitions

### REQ-WEB-003: Menu Page
- Full digital menu organized by category
- Category filter tabs: Cold Coffee, Hot Coffee, Pizza, Milk Shakes, Mojitos, Burgers, Wraps, Sandwiches, Pockets, Fries, Fried Chicken, Fried Veg, Waffles, Add Ons
- Each item displays: name, description, price, image, veg/non-veg badge, best seller / chef special / recommended tags
- Search within menu
- Link to mobile app for ordering

### REQ-WEB-004: Gallery Page
- Photo and video gallery
- Category filters (food, ambience, events)
- Lightbox viewer

### REQ-WEB-005: Events Page
- Upcoming and past events
- Event detail pages
- RSVP / enquiry form

### REQ-WEB-006: Offers Page
- Active promotional offers
- Coupon code display
- Terms and conditions per offer

### REQ-WEB-007: Reservations Page
- Online table reservation form
- Date, time, guest count, seating preference selection
- Real-time table availability display
- Reservation confirmation with WhatsApp notification

### REQ-WEB-008: Contact Page
- Contact form (name, email, phone, message)
- Phone number, email, address
- Google Maps embed
- Operating hours

### REQ-WEB-009: SEO & Technical
- Schema markup (Restaurant, Menu, Event, Review)
- Open Graph and Twitter Card meta tags
- XML sitemap auto-generation
- robots.txt
- Google Business Profile integration
- Canonical URLs
- Page speed optimization (Core Web Vitals)

### REQ-WEB-010: Blog
- Blog listing page with categories and tags
- Individual blog post pages
- Author profiles
- Related posts
- Social sharing

---

## 4. Mobile App Requirements

### REQ-MOB-001: Authentication
- OTP login via phone number (Firebase Auth)
- Google Sign-In
- Apple Sign-In (iOS)
- Guest browsing (menu + gallery only)
- Session persistence with secure token storage

### REQ-MOB-002: Customer Profile
- Name, phone, email, profile photo (Supabase Storage)
- Birthday and anniversary dates (for reward triggers)
- Saved addresses
- Notification preferences
- Referral code display and sharing

### REQ-MOB-003: Home Screen
- Personalized greeting
- Active offers carousel
- Featured / recommended menu items
- Loyalty points summary widget
- Quick actions: Reserve, Order, Menu, Loyalty
- Upcoming reservations preview

### REQ-MOB-004: Menu & Ordering
- Full menu by category with search and filters
- Item detail screen: image, description, ingredients, prep time, veg/non-veg, tags
- Add to cart with quantity and add-ons selection
- Cart screen: items, subtotal, coupon input, order type (dine-in / takeaway)
- Coupon validation and discount display
- Order placement with payment selection (PhonePe, UPI, Cash)
- Order confirmation screen
- Real-time order tracking (status: placed → preparing → ready → delivered)
- Order history with reorder shortcut

### REQ-MOB-005: Reservation Workflow
1. Select Date (date picker, shows availability)
2. Select Time (available slots for chosen date)
3. Select Guests (1–8)
4. Select Seating Type (Standard, Dining, Premium Sofa, Private Sofa)
5. Select Table (visual layout showing available tables)
6. Pay Advance deposit (PhonePe / UPI)
7. Reservation Confirmed screen
8. Auto-send WhatsApp confirmation message
9. Auto-send push notification
10. Store reservation in backend

### REQ-MOB-006: Table Management (Display)
- Live table availability map reflecting actual cafe layout
- 9 tables with statuses: Available, Reserved, Occupied, Cleaning, Out Of Service
- Table details: type, capacity, current status

### REQ-MOB-007: Loyalty System
- Points balance display with tier badge (Bronze / Silver / Gold)
- Points earning: 1 point per ₹10 spent
- Points redemption in cart (100 points = ₹10 off)
- Tier thresholds: Bronze 0–999, Silver 1000–4999, Gold 5000+
- Referral rewards: 200 points per successful referral
- Birthday reward: 500 bonus points on birthday
- Anniversary reward: 300 bonus points on anniversary
- Points history log

### REQ-MOB-008: Offers & Rewards
- Active offers list with claim / apply in cart
- Scratch card style reward reveal (gamification)
- Push notification on new offer

### REQ-MOB-009: Notifications
- Push notifications via FCM
- In-app notification centre
- Notification categories: order updates, reservation updates, offers, loyalty, campaigns

### REQ-MOB-010: QR Menu
- Camera-based QR code scanner
- Opens digital menu in-app when QR scanned at table

### REQ-MOB-011: Favorites
- Save favorite menu items
- Quick reorder from favorites

---

## 5. Table Management — Cafe Layout

| Table | Type | Capacity |
|-------|------|----------|
| Table 1 | Standard Table | 2 |
| Table 2 | Standard Table | 2 |
| Table 3 | Dining Table | 3 |
| Table 4 | Dining Table | 3 |
| Table 5 | Premium Sofa | 4 |
| Table 6 | Premium Sofa | 4 |
| Table 7 | Premium Sofa | 4 |
| Table 8 | Private Sofa | 4 |
| Table 9 | Private Sofa | 4 |

**Table Statuses:** Available | Reserved | Occupied | Cleaning | Out Of Service

---

## 6. Menu Categories

Cold Coffee · Hot Coffee · Pizza · Milk Shakes · Mojitos · Burgers · Wraps · Sandwiches · Pockets · Fries · Fried Chicken · Fried Veg · Waffles · Add Ons

**Each menu item must support:**
- Name, Description, Price, Image (Supabase Storage URL)
- Category, Veg / Non-Veg flag
- Ingredients list
- Availability toggle
- Preparation time (minutes)
- Tags: Best Seller, Recommended, Chef Special (multi-select)

---

## 7. Loyalty System Requirements

### REQ-LOY-001: Points Earning
- Orders: 1 point per ₹10 spent (rounded down)
- Reservations: 50 bonus points on check-in
- Referrals: 200 points when referred user completes first order
- Birthday: 500 points credited on birthday date
- Anniversary: 300 points credited on anniversary date

### REQ-LOY-002: Tiers
| Tier | Points Range | Benefits |
|------|-------------|----------|
| Bronze | 0 – 999 | Standard earn rate |
| Silver | 1,000 – 4,999 | 1.25× earn multiplier, priority reservation |
| Gold | 5,000+ | 1.5× earn multiplier, priority reservation, free birthday dessert |

### REQ-LOY-003: Redemption
- Minimum redemption: 100 points
- Redemption rate: 100 points = ₹10
- Cannot redeem more than 50% of order value

---

## 8. CRM System Requirements

### REQ-CRM-001: Customer Profiles
- Full profile: personal info, contact, birthday, anniversary, profile photo
- Visit history with dates, tables, spend per visit
- Complete order history
- Reservation history
- Favorite items list
- Total lifetime spend
- Current loyalty points and tier

### REQ-CRM-002: Customer Segments
- VIP Customers: Gold tier or lifetime spend > ₹50,000
- Inactive Customers: No visit in last 60 days
- Frequent Visitors: 4+ visits in last 30 days
- New Customers: Joined in last 30 days
- Birthday This Month
- Anniversary This Month

### REQ-CRM-003: Customer Timeline
- Chronological activity feed per customer
- Events: order placed, reservation made, loyalty points earned/redeemed, campaign received, review submitted

---

## 9. Marketing Automation Requirements

### REQ-MKT-001: Campaign Types
- WhatsApp Campaigns: bulk or targeted messages via WhatsApp Business API
- Push Campaigns: FCM broadcast or segment-targeted
- Coupon Campaigns: auto-generate and distribute coupon codes
- Birthday Campaigns: auto-trigger on customer birthday
- Anniversary Campaigns: auto-trigger on anniversary
- Referral Campaigns: triggered when referral link shared
- Review Request: triggered 2 hours after order delivery / check-out
- Google Review Request: triggered 24 hours after visit

### REQ-MKT-002: Automation Triggers
- Reservation Created → WhatsApp confirmation + push notification
- Payment Success → push notification + CRM update + analytics update
- Order Delivered → review request after 2 hours
- Post Visit → loyalty points award + review request after 24 hours
- Birthday Date → birthday campaign + bonus points
- Anniversary Date → anniversary campaign + bonus points
- Inactivity 60 days → re-engagement WhatsApp / push

### REQ-MKT-003: Campaign Builder
- Audience selector (All / Segment / Manual list)
- Message template editor with variables ({{name}}, {{points}}, etc.)
- Schedule: immediate or scheduled datetime
- Channel: WhatsApp, Push, or both
- Performance tracking: sent, delivered, opened, converted

---

## 10. Payment System Requirements

### REQ-PAY-001: Payment Methods
- PhonePe Gateway (UPI, cards, net banking via PhonePe)
- Direct UPI (UPI ID / QR)
- Cash (recorded by staff at checkout)

### REQ-PAY-002: Payment Flows
- Order Payment: full amount at order placement
- Reservation Deposit: configurable advance amount (default ₹200)
- Deposit Adjustment: deposit deducted from final bill at checkout

### REQ-PAY-003: Webhooks & Automation
- PhonePe webhook on payment success / failure
- On success: confirm reservation/order, update CRM, send notifications
- On failure: notify customer, release held table slot
- Payment audit log for all transactions

---

## 11. Admin Dashboard Requirements

### REQ-ADM-001: Overview
- Real-time KPI cards: today's revenue, orders, reservations, occupancy
- Revenue trend chart (daily / weekly / monthly)
- Recent orders and reservations feed
- Alert panel: low stock, failed payments, long wait times

### REQ-ADM-002: Modules
- Reservations: list, filter, approve/reject, manual create
- Tables: visual layout, status override, seating capacity edit
- Orders: all orders, status management, refunds
- Customers: full CRM access, segmentation, customer detail view
- Payments: transaction log, refund initiation, export
- Offers: create/edit/deactivate offers and coupon codes
- Campaigns: campaign builder, scheduler, performance reports
- Menu Management: full CRUD for categories and items, image upload
- Staff Management: invite staff, assign roles, deactivate accounts
- Role Management: define role permissions (RBAC)
- Analytics: all analytics modules

### REQ-ADM-003: Analytics Modules
- Revenue: daily/weekly/monthly with comparison periods
- Orders: volume, average value, fulfillment time
- Reservations: booking rate, no-show rate, popular slots
- Occupancy Rate: per table, per time slot, overall
- Average Spend per customer
- Top Customers by spend and visit frequency
- Popular Menu Items: ordered, revenue contribution
- Popular Tables: utilization rate
- Peak Hours heatmap
- Customer Retention: cohort analysis
- Campaign Performance: per campaign metrics

---

## 12. Staff Dashboard Requirements

### REQ-STF-001: Today's View
- Today's reservations timeline
- Table status board (live, matches actual layout)
- Pending orders queue

### REQ-STF-002: Actions
- Check In Customer: confirm arrival, mark table Occupied
- Check Out Customer: collect payment (cash), mark table Cleaning, trigger loyalty points
- Update Table Status: Available / Cleaning / Out Of Service
- Order Management: view incoming orders, update status (preparing / ready)
- Kitchen Status: mark order as ready from kitchen view

---

## 13. Database Requirements

### REQ-DB-001: Schema Coverage
All entities must be fully modelled in PostgreSQL:
- branches, users, roles, permissions, role_permissions
- tables, table_statuses
- menu_categories, menu_items, menu_item_tags
- orders, order_items, order_status_history
- reservations, reservation_status_history
- payments, payment_events (webhook log)
- loyalty_accounts, loyalty_transactions, loyalty_tiers
- referrals
- coupons, coupon_redemptions
- offers
- campaigns, campaign_recipients, campaign_events
- crm_segments, customer_segments_members
- reviews
- audit_logs
- blog_posts, blog_categories

### REQ-DB-002: Data Quality
- All foreign keys with ON DELETE rules
- CHECK constraints on enums and numeric ranges
- Indexes on all foreign keys, filter columns, and sort columns
- Timestamps: created_at, updated_at on all tables (auto-managed)
- Soft delete (deleted_at) on business-critical tables

---

## 14. API Requirements

### REQ-API-001: General
- RESTful FastAPI with versioned prefix `/api/v1/`
- Full OpenAPI / Swagger documentation at `/docs`
- JWT authentication (Firebase token verification)
- RBAC middleware: endpoint-level role enforcement
- Request validation via Pydantic v2
- Rate limiting: 100 req/min for authenticated, 20 req/min for public
- Structured logging (JSON) with request ID tracing
- Audit log on all write operations (create/update/delete)

### REQ-API-002: Endpoint Groups
- `/auth` — token verification, profile sync
- `/menu` — categories and items (public read, admin write)
- `/orders` — CRUD, status updates, tracking
- `/reservations` — booking flow, availability, check-in/out
- `/tables` — status management
- `/loyalty` — points balance, earn, redeem, history
- `/offers` — list active, apply coupon
- `/payments` — initiate, webhook handler, refund
- `/crm` — customer profiles, segments, timeline
- `/campaigns` — create, schedule, send, stats
- `/analytics` — all analytics queries
- `/staff` — staff management
- `/admin` — admin-only config endpoints
- `/webhooks` — PhonePe, FCM

---

## 15. Deployment Requirements

### REQ-DEP-001: Infrastructure
- Docker containers for all services (API, Postgres, Redis for rate limiting)
- Docker Compose for local development
- Environment variables via `.env` files (never committed)
- CI/CD pipeline: GitHub Actions → build → test → deploy

### REQ-DEP-002: Reliability
- Database daily backups to Supabase Storage
- Point-in-time recovery strategy documented
- Health check endpoints on all services
- Graceful shutdown handling

---

## 16. Testing Requirements

### REQ-TST-001: Coverage
- Unit tests: all service-layer business logic (pytest)
- Integration tests: all API endpoints with test database
- E2E tests: critical user journeys (reservation flow, order flow, payment flow)
- Performance tests: API load testing (Locust) — target 200 concurrent users
- Accessibility tests: WCAG 2.1 AA for website (axe-core)

---

## 17. Security Requirements

- All API communication over HTTPS
- Firebase JWT verification on every protected route
- Passwords never stored (Firebase handles auth)
- Sensitive env vars (API keys, DB URL) never in source code
- Input sanitization and SQL injection prevention (ORM parameterized queries)
- PhonePe webhook signature verification
- CORS restricted to known origins
- Audit log for all admin/staff write operations
