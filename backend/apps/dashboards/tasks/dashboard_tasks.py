"""
Celery tasks for dashboard cache warming.
Scheduled via Celery Beat to keep dashboards fast.
"""
from celery import shared_task
from apps.common.cache import invalidate_all_dashboards
import logging

logger = logging.getLogger(__name__)


@shared_task
def warm_global_dashboard_cache():
    """
    Recalculates and re-caches global dashboard for all active users.
    Scheduled every 5 minutes via Celery Beat.
    """
    from apps.users.models import User
    from apps.dashboards.selectors import get_global_dashboard

    # Invalidate stale cache first
    invalidate_all_dashboards()

    users = User.objects.filter(is_active=True).values_list("id", flat=True)
    count = 0
    for user_id in users:
        try:
            user = User.objects.get(id=user_id)
            get_global_dashboard(user)
            count += 1
        except Exception as e:
            logger.warning(f"Failed to warm dashboard for user {user_id}: {e}")

    logger.info(f"Dashboard cache warmed for {count} users.")
    return {"warmed": count}


@shared_task
def recalculate_farm_dashboards():
    """
    Recalculates all farm dashboards.
    Scheduled every 10 minutes.
    """
    from apps.farms.models import Farm
    from apps.dashboards.selectors import get_farm_dashboard

    farms = Farm.objects.filter(is_active=True).values_list("id", flat=True)
    for farm_id in farms:
        try:
            get_farm_dashboard(farm_id)
        except Exception as e:
            logger.warning(f"Failed to warm farm dashboard {farm_id}: {e}")

    return {"farms_processed": len(farms)}
