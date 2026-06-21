"""Initial schema — all tables

Revision ID: 001
Revises:
Create Date: 2026-06-21
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── branches ─────────────────────────────────────────────────────────────
    op.create_table("branches",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("address", sa.Text),
        sa.Column("city", sa.String(100)),
        sa.Column("phone", sa.String(20)),
        sa.Column("email", sa.String(255)),
        sa.Column("google_maps_url", sa.String(500)),
        sa.Column("latitude", sa.Float),
        sa.Column("longitude", sa.Float),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── users ─────────────────────────────────────────────────────────────────
    op.create_table("users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("firebase_uid", sa.String(128), nullable=False, unique=True),
        sa.Column("phone", sa.String(20)),
        sa.Column("email", sa.String(255)),
        sa.Column("name", sa.String(255)),
        sa.Column("role", sa.String(20), nullable=False, server_default="customer"),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("branches.id")),
        sa.Column("avatar_url", sa.String(500)),
        sa.Column("birthday", sa.Date),
        sa.Column("anniversary", sa.Date),
        sa.Column("referral_code", sa.String(8), unique=True),
        sa.Column("referred_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("fcm_token", sa.String(500)),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_firebase_uid", "users", ["firebase_uid"])
    op.create_index("ix_users_phone", "users", ["phone"])
    op.create_index("ix_users_referral_code", "users", ["referral_code"])

    # ── cafe_tables ───────────────────────────────────────────────────────────
    op.create_table("cafe_tables",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("branches.id"), nullable=False),
        sa.Column("table_number", sa.Integer, nullable=False),
        sa.Column("table_type", sa.String(20), nullable=False),
        sa.Column("capacity", sa.Integer, nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="available"),
        sa.Column("position_x", sa.Integer),
        sa.Column("position_y", sa.Integer),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── menu_categories ───────────────────────────────────────────────────────
    op.create_table("menu_categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("branches.id"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.Column("image_url", sa.String(500)),
        sa.Column("display_order", sa.Integer, server_default="0"),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── menu_items ────────────────────────────────────────────────────────────
    op.create_table("menu_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("branches.id"), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("menu_categories.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("image_url", sa.String(500)),
        sa.Column("is_veg", sa.Boolean, server_default="true"),
        sa.Column("ingredients", postgresql.ARRAY(sa.String)),
        sa.Column("preparation_time", sa.Integer, server_default="15"),
        sa.Column("is_available", sa.Boolean, server_default="true"),
        sa.Column("is_best_seller", sa.Boolean, server_default="false"),
        sa.Column("is_recommended", sa.Boolean, server_default="false"),
        sa.Column("is_chef_special", sa.Boolean, server_default="false"),
        sa.Column("sort_order", sa.Integer, server_default="0"),
        sa.Column("addons", postgresql.JSONB),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── coupons ───────────────────────────────────────────────────────────────
    op.create_table("coupons",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("code", sa.String(20), nullable=False, unique=True),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("value", sa.Numeric(10, 2), nullable=False),
        sa.Column("min_order_value", sa.Numeric(10, 2), server_default="0"),
        sa.Column("max_discount", sa.Numeric(10, 2)),
        sa.Column("usage_limit", sa.Integer),
        sa.Column("used_count", sa.Integer, server_default="0"),
        sa.Column("valid_from", sa.DateTime(timezone=True)),
        sa.Column("valid_until", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── payments ──────────────────────────────────────────────────────────────
    op.create_table("payments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("branches.id"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("reference_type", sa.String(20), nullable=False),
        sa.Column("reference_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("method", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("gateway_txn_id", sa.String(255)),
        sa.Column("gateway_response", postgresql.JSONB),
        sa.Column("idempotency_key", sa.String(255), unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── orders ────────────────────────────────────────────────────────────────
    op.create_table("orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("branches.id"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("table_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("cafe_tables.id")),
        sa.Column("order_type", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False),
        sa.Column("discount_amount", sa.Numeric(10, 2), server_default="0"),
        sa.Column("points_redeemed", sa.Integer, server_default="0"),
        sa.Column("total_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("payment_method", sa.String(20)),
        sa.Column("payment_status", sa.String(20), server_default="pending"),
        sa.Column("coupon_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("coupons.id")),
        sa.Column("notes", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── reservations ──────────────────────────────────────────────────────────
    op.create_table("reservations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("branch_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("branches.id"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("table_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("cafe_tables.id"), nullable=False),
        sa.Column("reservation_date", sa.Date, nullable=False),
        sa.Column("reservation_time", sa.Time, nullable=False),
        sa.Column("guest_count", sa.Integer, nullable=False),
        sa.Column("seating_type", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("deposit_amount", sa.Numeric(10, 2), server_default="200"),
        sa.Column("deposit_paid", sa.Boolean, server_default="false"),
        sa.Column("payment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("payments.id")),
        sa.Column("special_requests", sa.Text),
        sa.Column("whatsapp_sent", sa.Boolean, server_default="false"),
        sa.Column("push_sent", sa.Boolean, server_default="false"),
        sa.Column("checked_in_at", sa.DateTime(timezone=True)),
        sa.Column("checked_out_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_reservations_date", "reservations", ["reservation_date"])


def downgrade() -> None:
    op.drop_table("reservations")
    op.drop_table("orders")
    op.drop_table("payments")
    op.drop_table("coupons")
    op.drop_table("menu_items")
    op.drop_table("menu_categories")
    op.drop_table("cafe_tables")
    op.drop_table("users")
    op.drop_table("branches")
