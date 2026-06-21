# Temptations Cafe Digital Experience Platform — Tasks

## Phase 1: Foundation & Infrastructure

- [ ] 1. Project scaffolding and monorepo setup
  - Create monorepo root with `apps/` and `packages/` structure
  - Initialize `apps/api` (FastAPI), `apps/web` (Next.js), `apps/admin` (Next.js), `apps/mobile` (Flutter)
  - Set up `docker-compose.yml` with PostgreSQL, Redis, API services
  - Configure `.env.example` files for all apps
  - Set up GitHub Actions CI/CD workflow skeleton
  - _Requirements: REQ-DEP-001_

- [ ] 2. Database: PostgreSQL schema and migrations
  - Set up Alembic with async SQLAlchemy
  - Create migration: branches, users, roles
  - Create migration: cafe_tables
  - Create migration: menu_categories, menu_items
  - Create migration: orders, order_items, order_status_history
  - Create migration: reservations, reservation_status_history
  - Create migration: payments, payment_events
  - Create migration: loyalty_accounts, loyalty_transactions, loyalty_tiers
  - Create migration: referrals, coupons, offers, coupon_redemptions
  - Create migration: campaigns, campaign_recipients
  - Create migration: reviews, audit_logs, blog_posts
  - Add all indexes and constraints
  - Create seed data (branches, tables, menu categories + items, loyalty tiers)
  - _Requirements: REQ-DB-001, REQ-DB-002_

- [ ] 3. FastAPI core setup
  - App factory with lifespan, CORS, exception handlers
  - Firebase Admin SDK integration for JWT verification
  - Auth middleware: verify Firebase token, upsert user, attach to request
  - RBAC middleware with role decorators
  - Redis-backed rate limiter middleware
  - Audit log middleware (intercepts write operations)
  - Structured JSON logging with request ID
  - Health check endpoint
  - Swagger/OpenAPI configuration
  - _Requirements: REQ-API-001_


---

## Phase 2: Backend API — Core Domains

- [ ] 4. Auth & User API
  - `POST /api/v1/auth/verify` — Firebase token verify + DB upsert
  - `GET /api/v1/auth/me` — current user profile
  - `PATCH /api/v1/auth/me` — update profile (name, birthday, anniversary, avatar)
  - Avatar upload to Supabase Storage
  - _Requirements: REQ-MOB-001, REQ-MOB-002_

- [ ] 5. Menu API
  - `GET /api/v1/menu/categories` — list all active categories
  - `GET /api/v1/menu/items` — list items with filters (category, veg, tags, search)
  - `GET /api/v1/menu/items/{id}` — item detail
  - `POST /api/v1/menu/categories` — admin: create category
  - `PUT /api/v1/menu/categories/{id}` — admin: update category
  - `POST /api/v1/menu/items` — admin: create item with image upload
  - `PUT /api/v1/menu/items/{id}` — admin: update item
  - `PATCH /api/v1/menu/items/{id}/availability` — admin: toggle availability
  - `DELETE /api/v1/menu/items/{id}` — admin: soft delete
  - _Requirements: REQ-WEB-003, REQ-MOB-004_

- [ ] 6. Table Management API
  - `GET /api/v1/tables` — list all tables with current status
  - `GET /api/v1/tables/availability?date=&time=&guests=` — available tables for slot
  - `PATCH /api/v1/tables/{id}/status` — staff: update table status
  - `PUT /api/v1/tables/{id}` — admin: update table config
  - _Requirements: REQ-MOB-006, REQ-STF-001_

- [ ] 7. Reservations API
  - `GET /api/v1/reservations/availability` — available slots query
  - `POST /api/v1/reservations` — customer: create reservation + initiate deposit payment
  - `GET /api/v1/reservations/my` — customer: own reservation history
  - `GET /api/v1/reservations/{id}` — detail
  - `PATCH /api/v1/reservations/{id}/status` — staff: check-in, check-out, no-show, cancel
  - `GET /api/v1/reservations` — admin/staff: all reservations with filters
  - `POST /api/v1/reservations` (admin) — manual reservation creation
  - _Requirements: REQ-MOB-005, REQ-WEB-007, REQ-STF-002_

- [ ] 8. Orders API
  - `POST /api/v1/orders` — customer: place order, validate cart + coupon
  - `GET /api/v1/orders/my` — customer: order history
  - `GET /api/v1/orders/{id}` — order detail + status tracking
  - `PATCH /api/v1/orders/{id}/status` — staff: update order status
  - `GET /api/v1/orders` — admin/staff: all orders with filters
  - `POST /api/v1/orders/{id}/cancel` — cancel with refund trigger
  - _Requirements: REQ-MOB-004_

- [ ] 9. Payments API
  - `POST /api/v1/payments/initiate` — create PhonePe payment session, return redirect URL
  - `POST /api/v1/webhooks/phonepe` — HMAC-verified PhonePe webhook handler
  - `GET /api/v1/payments/{id}` — payment status check
  - `POST /api/v1/payments/{id}/refund` — admin: initiate refund via PhonePe API
  - `GET /api/v1/payments` — admin: transaction log with filters
  - _Requirements: REQ-PAY-001, REQ-PAY-002, REQ-PAY-003_

- [ ] 10. Loyalty API
  - `GET /api/v1/loyalty/me` — balance, tier, history
  - `POST /api/v1/loyalty/redeem` — redeem points on active cart (returns discount amount)
  - `GET /api/v1/loyalty/transactions` — points history
  - Internal service: `award_points(user_id, amount, type, reference_id)`
  - Nightly cron: birthday + anniversary points
  - Tier upgrade logic on every earn transaction
  - _Requirements: REQ-LOY-001, REQ-LOY-002, REQ-LOY-003_


---

## Phase 3: Backend API — Advanced Systems

- [ ] 11. CRM API
  - `GET /api/v1/crm/customers` — paginated list with segment filter
  - `GET /api/v1/crm/customers/{id}` — full profile: orders, reservations, loyalty, timeline
  - `GET /api/v1/crm/segments` — list segments with counts
  - `GET /api/v1/crm/segments/{id}/members` — customers in segment
  - Background job: recompute segment membership nightly
  - _Requirements: REQ-CRM-001, REQ-CRM-002, REQ-CRM-003_

- [ ] 12. Offers & Coupons API
  - `GET /api/v1/offers` — list active offers (public)
  - `POST /api/v1/offers` — admin: create offer
  - `PUT /api/v1/offers/{id}` — admin: update offer
  - `POST /api/v1/coupons/validate` — validate coupon code + return discount
  - `GET /api/v1/coupons` — admin: all coupons with usage stats
  - `POST /api/v1/coupons` — admin: create coupon
  - _Requirements: REQ-MOB-004, REQ-ADM-002_

- [ ] 13. Marketing & Campaigns API
  - `POST /api/v1/campaigns` — admin: create campaign
  - `POST /api/v1/campaigns/{id}/send` — send immediately or schedule
  - `GET /api/v1/campaigns/{id}/stats` — sent, delivered, opened, converted counts
  - WhatsApp service: send template message via WhatsApp Business API
  - FCM service: send push notification (single or batch)
  - Campaign worker: background task processes campaign_recipients queue
  - _Requirements: REQ-MKT-001, REQ-MKT-002, REQ-MKT-003_

- [ ] 14. Automation Workflows
  - Implement reservation-created workflow (WhatsApp + FCM + CRM + analytics)
  - Implement payment-success workflow (confirm + notify + loyalty + analytics)
  - Implement post-visit workflow (loyalty points + review request scheduling)
  - Implement birthday/anniversary cron (points + WhatsApp + FCM)
  - Implement inactivity re-engagement cron (60-day check)
  - Implement review request scheduler (2h + 24h after visit)
  - _Requirements: REQ-MKT-002_

- [ ] 15. Analytics API
  - `GET /api/v1/analytics/revenue` — daily/weekly/monthly revenue with comparison
  - `GET /api/v1/analytics/orders` — volume, avg value, fulfillment time
  - `GET /api/v1/analytics/reservations` — booking rate, no-show, popular slots
  - `GET /api/v1/analytics/occupancy` — per table and overall occupancy rate
  - `GET /api/v1/analytics/top-customers` — by spend and visit frequency
  - `GET /api/v1/analytics/popular-items` — ordered count and revenue contribution
  - `GET /api/v1/analytics/peak-hours` — heatmap data by hour/day
  - `GET /api/v1/analytics/retention` — cohort retention data
  - `GET /api/v1/analytics/campaigns` — per-campaign performance metrics
  - _Requirements: REQ-ADM-003_

- [ ] 16. Staff & Role Management API
  - `GET /api/v1/staff` — admin: list all staff
  - `POST /api/v1/staff/invite` — admin: invite staff by phone/email, assign role
  - `PATCH /api/v1/staff/{id}/role` — admin: change role
  - `DELETE /api/v1/staff/{id}` — admin: deactivate staff account
  - `GET /api/v1/roles` — list roles and permissions
  - _Requirements: REQ-ADM-002_

- [ ] 17. Blog API
  - `GET /api/v1/blog/posts` — list published posts with pagination
  - `GET /api/v1/blog/posts/{slug}` — post detail
  - `POST /api/v1/blog/posts` — admin: create post
  - `PUT /api/v1/blog/posts/{id}` — admin: update post
  - `DELETE /api/v1/blog/posts/{id}` — admin: soft delete
  - _Requirements: REQ-WEB-010_

---

## Phase 4: Flutter Mobile App

- [ ] 18. Mobile app core setup
  - Flutter project with Riverpod, GoRouter, Dio, Clean Architecture structure
  - Brand theme: colors (`#052A16` green, `#F0CC8D` gold), typography (matching brand fonts)
  - Dio HTTP client with JWT interceptor and error handling
  - Firebase initialization (Auth + FCM)
  - GoRouter with auth guard
  - _Requirements: REQ-MOB-001_

- [ ] 19. Authentication screens
  - Phone number input screen
  - OTP verification screen (Firebase phone auth)
  - Google Sign-In button
  - Apple Sign-In button (iOS)
  - Post-auth: sync token with backend `/auth/verify`
  - _Requirements: REQ-MOB-001_

- [ ] 20. Home screen
  - Personalized greeting with customer name
  - Active offers carousel (swipeable)
  - Featured / recommended menu items horizontal scroll
  - Loyalty points summary card with tier badge
  - Quick action buttons: Reserve, Order, Menu, Loyalty
  - Upcoming reservations preview card
  - _Requirements: REQ-MOB-003_

- [ ] 21. Menu & Cart screens
  - Menu screen: category tabs, item grid, search bar, veg filter
  - Item detail bottom sheet: image, description, ingredients, tags, add-ons, add to cart
  - Cart screen: item list, quantity controls, coupon input, order type toggle, points redemption, order total
  - Payment selection sheet: PhonePe, UPI, Cash
  - Order confirmation screen with order ID and status
  - _Requirements: REQ-MOB-004_

- [ ] 22. Order tracking screen
  - Real-time order status stepper (placed → preparing → ready → delivered)
  - Estimated time display
  - Order items summary
  - Support contact button
  - _Requirements: REQ-MOB-004_

- [ ] 23. Reservation flow screens
  - Date picker screen (calendar with availability indicators)
  - Time slot picker screen
  - Guest count selector
  - Seating type selector (Standard / Dining / Premium Sofa / Private Sofa)
  - Table selector: visual 3×3 grid of 9 tables with status colors
  - Advance payment screen (PhonePe / UPI)
  - Reservation confirmed screen with details and WhatsApp share button
  - _Requirements: REQ-MOB-005_

- [ ] 24. Loyalty screen
  - Points balance with animated counter
  - Tier progress bar (current → next tier)
  - Tier benefits list
  - Points history list
  - Referral section: code display, share button
  - _Requirements: REQ-MOB-007_

- [ ] 25. Profile & Settings screens
  - Profile edit: name, email, birthday, anniversary, avatar upload
  - Order history list with reorder button
  - Reservation history list
  - Favorites list
  - Notification preferences toggles
  - Logout
  - _Requirements: REQ-MOB-002_

- [ ] 26. QR Menu scanner
  - Camera permission request
  - QR code scanner (uses camera)
  - On scan: navigate to menu screen filtered to scanned category or item
  - _Requirements: REQ-MOB-010_

- [ ] 27. Push notifications handling
  - FCM initialization and token registration to backend
  - Foreground notification display
  - Background notification tap → deep link to relevant screen
  - In-app notification centre screen
  - _Requirements: REQ-MOB-009_


---

## Phase 5: Customer Website (Next.js)

- [ ] 28. Website core setup
  - Next.js 14 App Router project with TypeScript, Tailwind CSS, Shadcn UI
  - Brand theme configuration (CSS variables matching palette)
  - Shared layout: Navbar, Footer
  - API client (`lib/api.ts`) with server-side fetch helpers
  - SEO utilities (`lib/seo.ts`): generateMetadata helper, Open Graph defaults
  - _Requirements: REQ-WEB-009_

- [ ] 29. Homepage
  - Hero section: full-screen brand image, tagline, Reserve + Order CTAs
  - Featured menu items carousel (data from API)
  - Active offers banner
  - Customer reviews section (star ratings + testimonials)
  - Gallery preview strip (4–6 images)
  - Events teaser section
  - Download app section (App Store + Play Store badges)
  - Google Maps embed (location)
  - _Requirements: REQ-WEB-001_

- [ ] 30. Menu page
  - Category tab navigation (all 14 categories)
  - Item grid with name, image, price, veg badge, tags
  - Search bar (client-side filter)
  - Veg/Non-Veg toggle filter
  - Schema.org Menu markup
  - _Requirements: REQ-WEB-003_

- [ ] 31. Reservations page
  - Multi-step reservation form: date → time → guests → seating → confirm
  - Real-time availability check via API
  - Phone number input + OTP for identity (Firebase Web SDK)
  - Redirect to PhonePe for deposit payment
  - Confirmation page with reservation details
  - _Requirements: REQ-WEB-007_

- [ ] 32. Remaining website pages
  - About page: story, values, team
  - Gallery page: filterable image/video grid with lightbox
  - Events page: event cards + detail pages
  - Offers page: offer cards with coupon codes
  - Contact page: form, map, operating hours
  - Blog: listing + individual post pages
  - _Requirements: REQ-WEB-002, REQ-WEB-004, REQ-WEB-005, REQ-WEB-006, REQ-WEB-008, REQ-WEB-010_

- [ ] 33. SEO & technical
  - generateMetadata for all pages (title, description, OG, Twitter)
  - JSON-LD schema markup: Restaurant, Menu, Event, BreadcrumbList
  - XML sitemap (`app/sitemap.ts`)
  - robots.txt (`app/robots.ts`)
  - next-sitemap or manual sitemap generation
  - Core Web Vitals optimization: image optimization (next/image), lazy loading, font optimization
  - _Requirements: REQ-WEB-009_

---

## Phase 6: Admin Dashboard (Next.js)

- [ ] 34. Admin dashboard core
  - Next.js app with Shadcn UI, sidebar navigation, auth guard
  - Firebase Web SDK login for admin/staff
  - Role-based route protection (admin vs staff views)
  - Dashboard layout with sidebar, topbar, breadcrumbs
  - Overview page: KPI cards, revenue chart, recent orders feed, alerts

- [ ] 35. Menu management
  - Category list with drag-to-reorder, add/edit/delete
  - Menu item table with search, filter by category/availability
  - Item create/edit form: all fields + image upload to Supabase Storage
  - Bulk availability toggle
  - _Requirements: REQ-ADM-002_

- [ ] 36. Reservations management
  - Reservations table with date/status/customer filters
  - Reservation detail panel
  - Manual reservation creation form
  - Approve / cancel / no-show actions
  - Export to CSV

- [ ] 37. Table management
  - Visual table layout (9 tables in grid)
  - Status badges with color codes (Available=green, Reserved=amber, Occupied=red, Cleaning=blue, OOS=grey)
  - Click table → status override modal
  - Real-time status updates (polling every 30s)

- [ ] 38. Orders management
  - Orders table with filters (status, date, type)
  - Order detail side panel
  - Status update actions
  - Refund initiation
  - Print order receipt

- [ ] 39. CRM module
  - Customer table with search and segment filter
  - Customer detail page: profile, tabs for orders, reservations, loyalty, timeline
  - Segment overview cards with customer counts
  - Export segment to CSV
  - _Requirements: REQ-CRM-001, REQ-CRM-002_

- [ ] 40. Campaigns & Marketing
  - Campaigns list with status badges
  - Campaign builder: audience, message template (with variable preview), channel, schedule
  - Campaign detail: recipient list, performance stats (sent/delivered/opened)
  - Offers management: create/edit/deactivate offers
  - Coupon management: generate codes, set rules, view usage
  - _Requirements: REQ-MKT-001, REQ-MKT-003_

- [ ] 41. Analytics dashboard
  - Revenue charts: line chart with period selector (today/week/month/year)
  - Orders analytics: bar chart + metrics
  - Reservations analytics: booking rate, no-show rate
  - Occupancy heatmap: tables × time slots
  - Top customers table
  - Popular items bar chart
  - Peak hours heatmap (day × hour)
  - Campaign performance table
  - _Requirements: REQ-ADM-003_

- [ ] 42. Staff dashboard view
  - Today's reservations timeline (for STAFF role)
  - Live table status board
  - Check In / Check Out buttons per reservation
  - Orders queue with status update buttons
  - Kitchen status view: preparing orders list
  - _Requirements: REQ-STF-001, REQ-STF-002_

- [ ] 43. Staff & Role management
  - Staff list with role badges
  - Invite staff form (phone + role assignment)
  - Edit role / deactivate account
  - Role permissions matrix editor
  - _Requirements: REQ-ADM-002_

- [ ] 44. Payments module
  - Transaction log table with filters
  - Payment detail view with gateway response
  - Refund initiation with reason input
  - Export to CSV

---

## Phase 7: Testing & Quality

- [ ] 45. Backend unit tests
  - Test loyalty service: earn, redeem, tier upgrade logic
  - Test coupon validation service: percentage, flat, min order, expiry
  - Test reservation availability logic
  - Test PhonePe webhook HMAC verification
  - Test RBAC middleware with different roles
  - _Requirements: REQ-TST-001_

- [ ] 46. Backend integration tests
  - Test full reservation flow: create → payment → confirm → check-in → check-out
  - Test order flow: place → pay → prepare → deliver → points awarded
  - Test campaign sending: create → send → recipient records created
  - Test auth: invalid token rejected, role enforcement
  - _Requirements: REQ-TST-001_

- [ ] 47. Website E2E tests (Playwright)
  - Homepage loads and all sections visible
  - Menu page: category filter works, search works
  - Reservation flow: completes successfully
  - _Requirements: REQ-TST-001_

- [ ] 48. Performance & accessibility
  - API load test with Locust: 200 concurrent users on menu + order endpoints
  - Website accessibility audit with axe-core (WCAG 2.1 AA)
  - Lighthouse scores: target 90+ on all Core Web Vitals
  - _Requirements: REQ-TST-001_

---

## Phase 8: Deployment & Documentation

- [ ] 49. Production Docker setup
  - Production `Dockerfile` for FastAPI (multi-stage, non-root user)
  - Production `docker-compose.prod.yml` with Nginx
  - Nginx config: reverse proxy, SSL termination, gzip, security headers
  - `docker-compose.yml` for local dev with hot reload

- [ ] 50. CI/CD pipeline
  - GitHub Actions: `test.yml` — run pytest on PR
  - GitHub Actions: `deploy.yml` — build image, push registry, SSH deploy on merge to main
  - Alembic migration step in deploy workflow
  - Slack / email notification on deploy success/failure

- [ ] 51. Backup & monitoring
  - pg_dump cron: daily backup to Supabase Storage (retain 30 days)
  - Uptime monitoring setup (UptimeRobot or similar)
  - Error tracking setup (Sentry for API + web)
  - Log aggregation (structured JSON → log file or Loki)

- [ ] 52. Documentation
  - `README.md` at monorepo root: setup guide, architecture overview
  - `apps/api/README.md`: API setup, environment variables, migration instructions
  - `apps/web/README.md` + `apps/admin/README.md`: frontend setup
  - `apps/mobile/README.md`: Flutter setup, flavors, build commands
  - `docs/DEPLOYMENT.md`: step-by-step production deployment guide
  - `docs/TESTING.md`: how to run all test suites
  - `docs/ARCHITECTURE.md`: system diagram, data flow, integration points
