"""
Background job scheduler using APScheduler.
Wired into FastAPI lifespan in main.py.
"""
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

logger = logging.getLogger(__name__)
_scheduler: AsyncIOScheduler | None = None


def get_scheduler() -> AsyncIOScheduler:
    global _scheduler
    if _scheduler is None:
        _scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")
    return _scheduler


async def _run_birthday_campaign():
    from app.database import AsyncSessionLocal
    from app.services.automation import send_birthday_campaign
    async with AsyncSessionLocal() as db:
        await send_birthday_campaign(db)


async def _run_anniversary_campaign():
    from app.database import AsyncSessionLocal
    from app.services.automation import send_anniversary_campaign
    async with AsyncSessionLocal() as db:
        await send_anniversary_campaign(db)


async def _run_expire_reservations():
    from app.database import AsyncSessionLocal
    from app.services.automation import expire_pending_reservations
    async with AsyncSessionLocal() as db:
        await expire_pending_reservations(db)


async def _run_no_show_detection():
    from app.database import AsyncSessionLocal
    from app.services.automation import detect_no_show_reservations
    async with AsyncSessionLocal() as db:
        await detect_no_show_reservations(db)


async def _run_reservation_reminders():
    from app.database import AsyncSessionLocal
    from app.services.automation import send_reservation_reminders
    async with AsyncSessionLocal() as db:
        await send_reservation_reminders(db)


async def _run_review_requests():
    from app.database import AsyncSessionLocal
    from app.services.automation import send_review_requests
    async with AsyncSessionLocal() as db:
        await send_review_requests(db)


async def _run_cleanup_waiting_list():
    from app.database import AsyncSessionLocal
    from app.services.automation import cleanup_expired_waiting_list
    async with AsyncSessionLocal() as db:
        await cleanup_expired_waiting_list(db)


async def _run_reengagement():
    from app.database import AsyncSessionLocal
    from app.services.automation import send_reengagement_campaign
    async with AsyncSessionLocal() as db:
        await send_reengagement_campaign(db)


async def _run_daily_settlement():
    from app.database import AsyncSessionLocal
    from app.services.settlements import generate_daily_settlement
    async with AsyncSessionLocal() as db:
        await generate_daily_settlement(db)


def start_scheduler():
    scheduler = get_scheduler()

    # Birthday & Anniversary — 9:00 AM daily
    scheduler.add_job(_run_birthday_campaign,    CronTrigger(hour=9, minute=0),  id="birthday",    replace_existing=True)
    scheduler.add_job(_run_anniversary_campaign, CronTrigger(hour=9, minute=0),  id="anniversary", replace_existing=True)

    # Reservation expiry — every 5 minutes
    scheduler.add_job(_run_expire_reservations,  IntervalTrigger(minutes=5),     id="res_expiry",  replace_existing=True)
    scheduler.add_job(_run_no_show_detection,    IntervalTrigger(minutes=15),    id="no_show",     replace_existing=True)

    # Reservation reminders — 10:00 AM daily
    scheduler.add_job(_run_reservation_reminders, CronTrigger(hour=10, minute=0), id="res_remind",  replace_existing=True)

    # Review requests — every hour
    scheduler.add_job(_run_review_requests,      IntervalTrigger(hours=1),       id="review_req",  replace_existing=True)

    # Waiting list cleanup — every hour
    scheduler.add_job(_run_cleanup_waiting_list, IntervalTrigger(hours=1),       id="waiting_list_cleanup", replace_existing=True)

    # Re-engagement — 11:00 AM every Monday
    scheduler.add_job(_run_reengagement,         CronTrigger(day_of_week="mon", hour=11), id="reengagement", replace_existing=True)

    # Daily settlement — 2:00 AM daily (end of business day)
    scheduler.add_job(_run_daily_settlement,      CronTrigger(hour=2, minute=0), id="settlement", replace_existing=True)

    scheduler.start()
    logger.info("Background scheduler started with 8 jobs")


def stop_scheduler():
    scheduler = get_scheduler()
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Background scheduler stopped")
