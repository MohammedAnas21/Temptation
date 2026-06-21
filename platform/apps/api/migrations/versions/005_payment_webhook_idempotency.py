"""Payment webhook idempotency and monitoring indexes

Revision ID: 005
Revises: 004
Create Date: 2026-06-21
"""
from alembic import op
import sqlalchemy as sa

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("payment_events", sa.Column("event_hash", sa.String(length=64), nullable=True))
    op.create_index("ix_payment_events_event_hash", "payment_events", ["event_hash"], unique=True)
    op.create_index("ix_payment_events_type_created", "payment_events", ["event_type", "created_at"])
    op.create_index("ix_payment_events_payment_created", "payment_events", ["payment_id", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_payment_events_payment_created", table_name="payment_events")
    op.drop_index("ix_payment_events_type_created", table_name="payment_events")
    op.drop_index("ix_payment_events_event_hash", table_name="payment_events")
    op.drop_column("payment_events", "event_hash")
