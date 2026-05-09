"""
Management command: python manage.py seed_permissions
Seeds all system permissions and a SuperAdmin role.
Safe to run multiple times (idempotent).
"""
from django.core.management.base import BaseCommand
from apps.permissions.models import Permission, PermissionGroup, Role

MODULES = [
    "dashboard", "provinces", "farms", "employees", "chickens",
    "feed", "expenses", "income", "capital", "reports",
    "users", "roles", "permissions", "settings", "audit_logs",
]

ACTIONS = ["view", "create", "update", "delete", "approve", "export", "manage", "archive"]


class Command(BaseCommand):
    help = "Seed all system permissions and SuperAdmin role."

    def handle(self, *args, **options):
        group, _ = PermissionGroup.objects.get_or_create(
            name="System",
            defaults={"description": "Auto-generated system permissions"},
        )

        created_count = 0
        all_perms = []

        for module in MODULES:
            for action in ACTIONS:
                key = f"{module}.{action}"
                perm, created = Permission.objects.get_or_create(
                    permission_key=key,
                    defaults={
                        "group": group,
                        "module": module,
                        "action": action,
                        "description": f"Can {action} {module}",
                        "is_system": True,
                    },
                )
                all_perms.append(perm)
                if created:
                    created_count += 1

        # Create SuperAdmin role with all permissions
        role, _ = Role.objects.get_or_create(
            name="SuperAdmin",
            defaults={"description": "Full system access", "is_system": True, "is_active": True},
        )
        role.permissions.set(all_perms)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {created_count} new permissions. SuperAdmin role updated with {len(all_perms)} permissions."
        ))
