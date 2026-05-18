"""
Audit service — call this from any service that performs a sensitive action.
"""
from apps.audit_logs.models import AuditLog


def _sanitize(value):
    """
    Recursively convert a value to something JSON-serializable.
    Django model instances, date/datetime objects, Decimals, UUIDs, etc.
    are all converted to their string/primitive equivalents.
    """
    import uuid
    import decimal
    import datetime

    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    if isinstance(value, (uuid.UUID,)):
        return str(value)
    if isinstance(value, decimal.Decimal):
        return float(value)
    if isinstance(value, (datetime.date, datetime.datetime)):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _sanitize(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_sanitize(v) for v in value]
    # Django model instance — store its pk
    if hasattr(value, "pk"):
        return str(value.pk)
    # Fallback
    return str(value)


def log_action(user, action: str, entity_name: str, entity_id=None, metadata: dict = None):
    """
    Creates an immutable audit log entry.

    Args:
        user: The User instance performing the action (can be None for system actions).
        action: e.g. "create", "update", "delete", "approve", "export"
        entity_name: e.g. "Farm", "Expense", "ChickenMovement"
        entity_id: UUID of the affected record.
        metadata: Any extra context as a dict.
    """
    safe_metadata = _sanitize(metadata or {})
    AuditLog.objects.create(
        user=user,
        action=action,
        entity_name=entity_name,
        entity_id=entity_id,
        metadata=safe_metadata,
    )
