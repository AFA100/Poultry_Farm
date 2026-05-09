"""
Celery tasks for system maintenance and cleanup.
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task
def cleanup_expired_tokens():
    """
    Removes expired JWT blacklisted tokens.
    Scheduled daily.
    """
    try:
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
        cutoff = timezone.now() - timedelta(days=8)
        deleted, _ = OutstandingToken.objects.filter(expires_at__lt=cutoff).delete()
        logger.info(f"Cleaned up {deleted} expired tokens.")
        return {"deleted_tokens": deleted}
    except Exception as e:
        logger.error(f"Token cleanup failed: {e}")
        return {"error": str(e)}


@shared_task
def archive_old_audit_logs():
    """
    Audit logs are immutable and must never be deleted.
    This task only logs a count for monitoring purposes.
    """
    from apps.audit_logs.models import AuditLog
    total = AuditLog.objects.count()
    logger.info(f"Audit log count: {total}")
    return {"total_audit_logs": total}
