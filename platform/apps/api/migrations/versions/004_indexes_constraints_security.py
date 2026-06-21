"""Production indexes, constraints, double-booking prevention, check constraints

Revision ID: 004
Revises: 003
Create Date: 2026-06-21
"""
from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Performance indexes ───────────────────────────────────────────────────
    op.create_index("ix_orders_customer_id",     "orders",        ["customer_id"])
    op.create_index("ix_orders_status",          "orders",        ["status"])
    op.create_index("ix_orders_created_at",      "orders",        ["created_at"])
    op.create_index("ix_orders_branch_created",  "orders",        ["branch_id", "created_at"])

    op.create_index("ix_reservations_customer",  "reservations",  ["customer_id"])
    op.create_index("ix_reservations_status",    "reservations",  ["status"])
    op.create_index("ix_reservations_table_slot","reservations",  ["table_id", "reservation_date", "reservation_time"])

    op.create_index("ix_payments_status",        "payments",      ["status"])
    op.create_index("ix_payments_gateway_txn",   "payments",      ["gateway_txn_id"])
    op.create_index("ix_payments_reference",     "payments",      ["reference_id", "reference_type"])

    op.create_index("ix_loyalty_txn_user",       "loyalty_transactions", ["user_id"])
    op.create_index("ix_loyalty_txn_created",    "loyalty_transactions", ["created_at"])

    op.create_index("ix_campaign_recipients_campaign", "campaign_recipients", ["campaign_id"])
    op.create_index("ix_campaign_recipients_user",     "campaign_recipients", ["user_id"])

    op.create_index("ix_audit_logs_entity",      "audit_logs",    ["entity_type", "entity_id"])
    op.create_index("ix_audit_logs_user",        "audit_logs",    ["user_id"])
    op.create_index("ix_audit_logs_created",     "audit_logs",    ["created_at"])

    op.create_index("ix_order_items_order",      "order_items",   ["order_id"])
    op.create_index("ix_order_items_menu_item",  "order_items",   ["menu_item_id"])

    op.create_index("ix_menu_items_category",    "menu_items",    ["category_id"])
    op.create_index("ix_menu_items_available",   "menu_items",    ["branch_id", "is_available"])

    # ── Double-booking prevention (partial unique index) ──────────────────────
    # Only one active reservation per table per date+time slot
    op.execute("""
        CREATE UNIQUE INDEX uq_reservations_no_double_book
        ON reservations(table_id, reservation_date, reservation_time)
        WHERE status IN ('pending', 'confirmed', 'checked_in')
    """)

    # ── Check constraints ─────────────────────────────────────────────────────
    op.execute("""
        ALTER TABLE reservations
        ADD CONSTRAINT ck_reservations_guest_count
        CHECK (guest_count BETWEEN 1 AND 20)
    """)
    op.execute("""
        ALTER TABLE orders
        ADD CONSTRAINT ck_orders_total_non_negative
        CHECK (total_amount >= 0)
    """)
    op.execute("""
        ALTER TABLE payments
        ADD CONSTRAINT ck_payments_amount_positive
        CHECK (amount > 0)
    """)
    op.execute("""
        ALTER TABLE loyalty_accounts
        ADD CONSTRAINT ck_loyalty_balance_non_negative
        CHECK (points_balance >= 0)
    """)
    op.execute("""
        ALTER TABLE coupons
        ADD CONSTRAINT ck_coupons_value_positive
        CHECK (value > 0)
    """)
    op.execute("""
        ALTER TABLE reviews
        ADD CONSTRAINT ck_reviews_rating_range
        CHECK (rating BETWEEN 1 AND 5)
    """)
    op.execute("""
        ALTER TABLE cafe_tables
        ADD CONSTRAINT ck_tables_capacity_positive
        CHECK (capacity > 0)
    """)

    # ── Waiting list table ────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS reservation_waiting_list (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            branch_id UUID NOT NULL REFERENCES branches(id),
            customer_id UUID NOT NULL REFERENCES users(id),
            requested_date DATE NOT NULL,
            requested_time TIME NOT NULL,
            guest_count INT NOT NULL CHECK (guest_count BETWEEN 1 AND 20),
            seating_type VARCHAR(20) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'waiting',
            notified_at TIMESTAMPTZ,
            expires_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    op.create_index("ix_waiting_list_date", "reservation_waiting_list", ["requested_date", "branch_id"])

    # ── Reservation expiry column ─────────────────────────────────────────────
    op.execute("""
        ALTER TABLE reservations
        ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ
    """)

    # ── Customer favorites table ──────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS user_favorites (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(user_id, menu_item_id)
        )
    """)

    # ── Customer activity timeline view ──────────────────────────────────────
    op.execute("""
        CREATE OR REPLACE VIEW customer_timeline AS
        SELECT user_id, 'order' AS event_type, id AS reference_id,
               created_at, total_amount::text AS detail
        FROM orders
        UNION ALL
        SELECT customer_id, 'reservation', id, created_at,
               reservation_date::text AS detail
        FROM reservations
        UNION ALL
        SELECT user_id, 'loyalty_' || type, reference_id, created_at,
               points::text AS detail
        FROM loyalty_transactions
        ORDER BY created_at DESC
    """)

    # ── Settlement reports table ──────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS daily_settlements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            branch_id UUID NOT NULL REFERENCES branches(id),
            settlement_date DATE NOT NULL,
            total_orders INT NOT NULL DEFAULT 0,
            total_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
            total_refunds NUMERIC(12,2) NOT NULL DEFAULT 0,
            net_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
            cash_collected NUMERIC(12,2) NOT NULL DEFAULT 0,
            phonepe_collected NUMERIC(12,2) NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(branch_id, settlement_date)
        )
    """)


def downgrade() -> None:
    # Drop in reverse order
    op.execute("DROP TABLE IF EXISTS daily_settlements")
    op.execute("DROP VIEW IF EXISTS customer_timeline")
    op.execute("DROP TABLE IF EXISTS user_favorites")
    op.execute("DROP TABLE IF EXISTS reservation_waiting_list")

    for constraint in [
        ("reservations", "ck_reservations_guest_count"),
        ("orders", "ck_orders_total_non_negative"),
        ("payments", "ck_payments_amount_positive"),
        ("loyalty_accounts", "ck_loyalty_balance_non_negative"),
        ("coupons", "ck_coupons_value_positive"),
        ("reviews", "ck_reviews_rating_range"),
        ("cafe_tables", "ck_tables_capacity_positive"),
    ]:
        op.execute(f"ALTER TABLE {constraint[0]} DROP CONSTRAINT IF EXISTS {constraint[1]}")

    op.drop_index("uq_reservations_no_double_book", table_name="reservations")

    for idx in [
        "ix_orders_customer_id", "ix_orders_status", "ix_orders_created_at", "ix_orders_branch_created",
        "ix_reservations_customer", "ix_reservations_status", "ix_reservations_table_slot",
        "ix_payments_status", "ix_payments_gateway_txn", "ix_payments_reference",
        "ix_loyalty_txn_user", "ix_loyalty_txn_created",
        "ix_campaign_recipients_campaign", "ix_campaign_recipients_user",
        "ix_audit_logs_entity", "ix_audit_logs_user", "ix_audit_logs_created",
        "ix_order_items_order", "ix_order_items_menu_item",
        "ix_menu_items_category", "ix_menu_items_available",
        "ix_waiting_list_date",
    ]:
        op.execute(f"DROP INDEX IF EXISTS {idx}")
