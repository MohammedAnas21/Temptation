# Testing Guide

## Backend (FastAPI — pytest)

### Run all tests
```bash
cd platform/apps/api
pytest tests/ -v --tb=short
```

### Run specific suites
```bash
pytest tests/unit/ -v           # Unit tests only
pytest tests/integration/ -v   # Integration tests (needs DB)
pytest tests/unit/test_loyalty.py -v
```

### Coverage report
```bash
pytest tests/ --cov=app --cov-report=html
open htmlcov/index.html
```

### Test database setup
Integration tests use a separate `temptations_test` database.
Start it with Docker:
```bash
docker run -d -e POSTGRES_DB=temptations_test -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
```

## Key Test Cases

### Loyalty Service (unit)
- `test_bronze_zero` — 0 points → bronze tier
- `test_silver_start` — 1000 points → silver tier
- `test_gold_start` — 5000 points → gold tier
- `test_redeem_points_success` — 100 pts → ₹10 discount
- `test_redeem_points_insufficient` — raises ValueError
- `test_redeem_points_below_minimum` — raises ValueError

### Coupon Service (unit)
- Valid percentage coupon → correct discount
- Invalid code → ValueError
- Expired coupon → ValueError
- Below minimum order → ValueError
- Flat coupon → correct discount
- Max discount cap applied

### Auth API (integration)
- Valid Firebase token → user created + profile returned
- Invalid token → 401
- Unauthenticated GET /me → 401
- Same Firebase UID twice → no duplicate user

### Menu API (integration)
- List items → 200 with array
- Unknown item ID → 404
- Create item without admin token → 401/403

## Frontend Testing

### Next.js (web + admin)
```bash
cd apps/web
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

### Playwright E2E (web)
```bash
npx playwright test
```

Key journeys:
- Homepage loads with all sections
- Menu page: category filter, search
- Reservation flow: complete 6-step booking

### Accessibility
```bash
npx axe-core-cli http://localhost:3000
```
Target: WCAG 2.1 AA

## Flutter Tests

```bash
cd apps/mobile
flutter test
flutter test test/widget_test.dart
```

## Performance Testing (Locust)

```bash
pip install locust
cd platform
locust -f locustfile.py --host=http://localhost:8000
# Open http://localhost:8089
# Target: 200 concurrent users, <200ms p95 on /menu/items
```
