"""
Audit service — call this from any service that performs a sensitive action.
"""
from apps.audit_logs.models import AuditLog


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
    AuditLog.objects.create(
        user=user,
        action=action,
        entity_name=entity_name,
        entity_id=entity_id,
        metadata=metadata or {},
    )
