"""Additional performance indexes for CRM search and occupancy queries

Revision ID: 006
Revises: 005
Create Date: 2026-06-21
"""
from alembic import op
import sqlalchemy as sa

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Enable pg_trgm for fuzzy text search ──────────────────────────────────
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # ── Trigram indexes for CRM ilike search ──────────────────────────────────
    op.execute(
        "CREATE INDEX ix_users_name_trgm ON users USING gin (name gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX ix_users_phone_trgm ON users USING gin (phone gin_trgm_ops)"
    )

    # ── Composite index for reservation occupancy/analytics queries ───────────
    op.create_index(
        "ix_reservations_branch_date_status",
        "reservations",
        ["branch_id", "reservation_date", "status"],
    )

    # ── Partial index for active reservation conflict lookups ─────────────────
    op.execute("""
        CREATE INDEX ix_reservations_active_conflicts
        ON reservations(table_id, reservation_date, reservation_time)
        WHERE status IN ('confirmed', 'checked_in')
    """)

    # ── Index for campaign recipient delivery tracking ────────────────────────
    op.create_index(
        "ix_campaign_recipients_status",
        "campaign_recipients",
        ["status"],
    )

    # ── Index for coupon redemption lookups by user ───────────────────────────
    op.create_index(
        "ix_coupon_redemptions_user",
        "coupon_redemptions",
        ["user_id"],
    )

    # ── Index for referral tracking ───────────────────────────────────────────
    op.create_index(
        "ix_referrals_referrer",
        "referrals",
        ["referrer_id"],
    )
    op.create_index(
        "ix_referrals_status",
        "referrals",
        ["status"],
    )

    # ── Index for waiting list notifications ──────────────────────────────────
    op.create_index(
        "ix_waiting_list_status",
        "reservation_waiting_list",
        ["status"],
    )

    # ── Review lookup indexes ─────────────────────────────────────────────────
    op.create_index(
        "ix_reviews_user",
        "reviews",
        ["user_id"],
    )
    op.create_index(
        "ix_reviews_rating",
        "reviews",
        ["rating"],
    )


def downgrade() -> None:
    for idx in [
        "ix_reviews_rating",
        "ix_reviews_user",
        "ix_waiting_list_status",
        "ix_referrals_status",
        "ix_referrals_referrer",
        "ix_coupon_redemptions_user",
        "ix_campaign_recipients_status",
        "ix_reservations_active_conflicts",
        "ix_reservations_branch_date_status",
        "ix_users_phone_trgm",
        "ix_users_name_trgm",
    ]:
        op.execute(f"DROP INDEX IF EXISTS {idx}")
