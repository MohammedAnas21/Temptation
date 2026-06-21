# Import all models so Alembic can detect them
from app.models.branch import Branch
from app.models.user import User, UserRole
from app.models.table import CafeTable, TableType, TableStatus
from app.models.menu import MenuCategory, MenuItem
from app.models.order import Order, OrderItem, OrderStatusHistory, OrderType, OrderStatus, PaymentMethod, PaymentStatus
from app.models.reservation import Reservation, ReservationStatusHistory, SeatingType, ReservationStatus
from app.models.payment import Payment, PaymentEvent
from app.models.loyalty import LoyaltyAccount, LoyaltyTransaction, LoyaltyTier, Referral
from app.models.marketing import Coupon, CouponRedemption, Offer, Campaign, CampaignRecipient
from app.models.audit import AuditLog, Review
from app.models.blog import BlogCategory, BlogPost

__all__ = [
    "Branch", "User", "UserRole",
    "CafeTable", "TableType", "TableStatus",
    "MenuCategory", "MenuItem",
    "Order", "OrderItem", "OrderStatusHistory", "OrderType", "OrderStatus", "PaymentMethod", "PaymentStatus",
    "Reservation", "ReservationStatusHistory", "SeatingType", "ReservationStatus",
    "Payment", "PaymentEvent",
    "LoyaltyAccount", "LoyaltyTransaction", "LoyaltyTier", "Referral",
    "Coupon", "CouponRedemption", "Offer", "Campaign", "CampaignRecipient",
    "AuditLog", "Review",
    "BlogCategory", "BlogPost",
]
