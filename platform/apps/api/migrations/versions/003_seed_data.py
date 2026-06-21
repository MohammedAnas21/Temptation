"""Seed data — branch, tables, menu categories, loyalty tiers

Revision ID: 003
Revises: 002
Create Date: 2026-06-21
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert
import uuid

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None

BRANCH_ID = "11111111-1111-1111-1111-111111111111"


def upgrade() -> None:
    conn = op.get_bind()

    # ── Branch ────────────────────────────────────────────────────────────────
    conn.execute(sa.text("""
        INSERT INTO branches (id, name, address, city, phone, email, latitude, longitude, is_active)
        VALUES (:id, :name, :address, :city, :phone, :email, :lat, :lng, true)
        ON CONFLICT DO NOTHING
    """), {"id": BRANCH_ID, "name": "Temptations Cafe", "address": "Kalaburagi, Karnataka",
           "city": "Kalaburagi", "phone": "+919876543210", "email": "hello@temptationscafe.in",
           "lat": 17.3297, "lng": 76.8206})

    # ── Tables ────────────────────────────────────────────────────────────────
    tables = [
        ("1", "standard",    2, 1, 1), ("2", "standard",    2, 2, 1),
        ("3", "dining",      3, 1, 2), ("4", "dining",      3, 2, 2),
        ("5", "premium_sofa",4, 1, 3), ("6", "premium_sofa",4, 2, 3),
        ("7", "premium_sofa",4, 3, 3), ("8", "private_sofa",4, 1, 4),
        ("9", "private_sofa",4, 2, 4),
    ]
    for num, ttype, cap, px, py in tables:
        conn.execute(sa.text("""
            INSERT INTO cafe_tables (id, branch_id, table_number, table_type, capacity, status, position_x, position_y)
            VALUES (gen_random_uuid(), :branch_id, :num, :type, :cap, 'available', :px, :py)
        """), {"branch_id": BRANCH_ID, "num": num, "type": ttype, "cap": cap, "px": px, "py": py})

    # ── Menu Categories ───────────────────────────────────────────────────────
    categories = [
        ("cold-coffee", "Cold Coffee", 1), ("hot-coffee", "Hot Coffee", 2),
        ("pizza", "Pizza", 3), ("milk-shakes", "Milk Shakes", 4),
        ("mojitos", "Mojitos", 5), ("burgers", "Burgers", 6),
        ("wraps", "Wraps", 7), ("sandwiches", "Sandwiches", 8),
        ("pockets", "Pockets", 9), ("fries", "Fries", 10),
        ("fried-chicken", "Fried Chicken", 11), ("fried-veg", "Fried Veg", 12),
        ("waffles", "Waffles", 13), ("add-ons", "Add Ons", 14),
    ]
    for slug, name, order in categories:
        conn.execute(sa.text("""
            INSERT INTO menu_categories (id, branch_id, name, slug, display_order, is_active)
            VALUES (gen_random_uuid(), :branch_id, :name, :slug, :order, true)
        """), {"branch_id": BRANCH_ID, "name": name, "slug": slug, "order": order})

    # ── Loyalty Tiers ─────────────────────────────────────────────────────────
    tiers = [
        ("bronze", 0,    999,  1.00, '{"description":"Standard earn rate"}'),
        ("silver", 1000, 4999, 1.25, '{"description":"1.25x earn multiplier, priority reservation"}'),
        ("gold",   5000, None, 1.50, '{"description":"1.5x earn, priority reservation, free birthday dessert"}'),
    ]
    for name, mn, mx, mult, benefits in tiers:
        conn.execute(sa.text("""
            INSERT INTO loyalty_tiers (id, name, min_points, max_points, earn_multiplier, benefits)
            VALUES (gen_random_uuid(), :name, :mn, :mx, :mult, :benefits::jsonb)
        """), {"name": name, "mn": mn, "mx": mx, "mult": mult, "benefits": benefits})


def downgrade() -> None:
    op.get_bind().execute(sa.text("DELETE FROM loyalty_tiers"))
    op.get_bind().execute(sa.text("DELETE FROM menu_categories WHERE branch_id = :id"), {"id": BRANCH_ID})
    op.get_bind().execute(sa.text("DELETE FROM cafe_tables WHERE branch_id = :id"), {"id": BRANCH_ID})
    op.get_bind().execute(sa.text("DELETE FROM branches WHERE id = :id"), {"id": BRANCH_ID})
