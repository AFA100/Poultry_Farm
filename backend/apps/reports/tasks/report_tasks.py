"""
Celery tasks for report generation and export.
Long-running report jobs must never run inside API requests.
"""
from celery import shared_task
from django.core.cache import cache
from apps.common.cache import key_report, REPORT_TTL
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def generate_profit_loss_report_task(self, user_id: str, farm_id=None, province_id=None,
                                      date_from=None, date_to=None):
    """
    Async profit/loss report generation.
    Result is cached so the frontend can poll for it.
    """
    try:
        from apps.users.models import User
        from apps.reports.selectors import get_profit_loss_report

        user = User.objects.get(id=user_id)
        data = get_profit_loss_report(
            user,
            date_from=date_from,
            date_to=date_to,
            farm_id=farm_id,
            province_id=province_id,
        )

        cache_key = key_report("profit_loss", farm_id, province_id, date_from, date_to)
        cache.set(cache_key, data, REPORT_TTL)

        logger.info(f"Profit/loss report generated for user {user_id}")
        return {"status": "done", "cache_key": cache_key}

    except Exception as exc:
        logger.error(f"Report task failed: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def generate_feed_consumption_report_task(self, user_id: str, farm_id=None,
                                           date_from=None, date_to=None):
    try:
        from apps.users.models import User
        from apps.reports.selectors import get_feed_consumption_report

        user = User.objects.get(id=user_id)
        data = get_feed_consumption_report(user, date_from=date_from, date_to=date_to, farm_id=farm_id)

        cache_key = key_report("feed_consumption", farm_id, None, date_from, date_to)
        cache.set(cache_key, data, REPORT_TTL)

        return {"status": "done", "cache_key": cache_key}

    except Exception as exc:
        raise self.retry(exc=exc)
