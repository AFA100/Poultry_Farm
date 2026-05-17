# Backend Overall Completed Schema

This document summarizes the completed backend database schema for the Poultry ERP system. It is the authoritative backend schema reference and includes compatibility guidance for the frontend data model and styling.

> Frontend schema and styling must be compatible with this backend.
> - Use the same field names and entity relationships.
> - Use UUID identifiers for primary keys.
> - Use the same enumerated values for dropdowns and filters.
> - Respect the API contract: `/api/v1/` versioned endpoints, paginated lists, standard success/error payloads.

---

## Database Type
- PostgreSQL
- Uses UUID primary keys and strong referential integrity
- Uses enums for domain-specific values
- Uses JSONB for audit metadata

## Core Extensions
- `uuid-ossp` for UUID generation

## Enums
- `employee_role_enum`: `farmer`, `worker`, `manager`
- `status_enum`: `active`, `inactive`
- `movement_type_enum`: `IN`, `OUT`
- `feed_unit_enum`: `bag`, `kg`
- `transaction_type_enum`: `IN`, `OUT`

---

## Users / Authentication / RBAC

### `users`
- `id` UUID PK
- `full_name` VARCHAR(150)
- `email` VARCHAR(150), unique
- `password_hash` TEXT
- `is_active` BOOLEAN
- `created_at`, `updated_at`

### `roles`
- `id` UUID PK
- `name` VARCHAR(100), unique
- `description` TEXT
- `is_system` BOOLEAN
- `is_active` BOOLEAN
- `created_at`

### `permission_groups`
- `id` UUID PK
- `name` VARCHAR(100), unique
- `description` TEXT
- `created_at`

### `permissions`
- `id` UUID PK
- `group_id` UUID FK optional
- `permission_key` VARCHAR(150), unique
- `module` VARCHAR(100)
- `action` VARCHAR(100)
- `description` TEXT
- `is_system` BOOLEAN
- `created_at`

### Role / User Permission Mapping
- `role_permissions` (`role_id`, `permission_id`)
- `user_roles` (`user_id`, `role_id`)
- `user_permissions` (`user_id`, `permission_id`)

---

## Organization Layer

### `provinces`
- `id` UUID PK
- `name` VARCHAR(100), unique
- `created_at`

### `farms`
- `id` UUID PK
- `province_id` UUID FK
- `name` VARCHAR(150)
- `location` TEXT
- `capacity` INTEGER CHECK >= 0
- `is_active` BOOLEAN
- `created_at`

### Access Control Tables
- `user_farm_access` (`user_id`, `farm_id`)
- `user_province_access` (`user_id`, `province_id`)

---

## Employee Module

### `employees`
- `id` UUID PK
- `farm_id` UUID FK
- `full_name` VARCHAR(150)
- `role` `employee_role_enum`
- `salary` NUMERIC(12,2) CHECK >= 0
- `hire_date` DATE
- `status` `status_enum` default `active`
- `created_at`

---

## Chicken Module

### `chicken_batches`
- `id` UUID PK
- `farm_id` UUID FK
- `quantity` INTEGER CHECK > 0
- `entry_date` DATE
- `source` VARCHAR(150)
- `cost_per_unit` NUMERIC(12,2)
- `status` `status_enum` default `active`
- `created_at`

### `chicken_movements`
- `id` UUID PK
- `farm_id` UUID FK
- `batch_id` UUID FK
- `type` `movement_type_enum`
- `quantity` INTEGER CHECK > 0
- `movement_date` DATE
- `reason` VARCHAR(100)
- `created_at`

---

## Feed Module

### `feed_inventory`
- `id` UUID PK
- `farm_id` UUID unique FK
- `quantity` NUMERIC(12,2) CHECK >= 0
- `unit` `feed_unit_enum`
- `last_updated` TIMESTAMP

### `feed_transactions`
- `id` UUID PK
- `farm_id` UUID FK
- `type` `transaction_type_enum`
- `quantity` NUMERIC(12,2) CHECK > 0
- `unit` `feed_unit_enum`
- `transaction_date` DATE
- `note` TEXT
- `created_at`

---

## Finance Module

### `expenses`
- `id` UUID PK
- `farm_id` UUID FK
- `category` VARCHAR(100)
- `amount` NUMERIC(12,2) CHECK >= 0
- `expense_date` DATE
- `description` TEXT
- `created_at`

### `income`
- `id` UUID PK
- `farm_id` UUID FK
- `source` VARCHAR(100)
- `amount` NUMERIC(12,2) CHECK >= 0
- `income_date` DATE
- `description` TEXT
- `created_at`

### `capital`
- `id` UUID PK
- `farm_id` UUID FK
- `amount` NUMERIC(12,2) CHECK >= 0
- `investment_date` DATE
- `note` TEXT
- `created_at`

---

## Audit Logging

### `audit_logs`
- `id` UUID PK
- `user_id` UUID FK optional
- `action` VARCHAR(100)
- `entity_name` VARCHAR(100)
- `entity_id` UUID
- `metadata` JSONB
- `created_at`

---

## API Contract Notes for Frontend Compatibility

- All list endpoints must be paginated and return the standard response shape:
  - `success`
  - `message`
  - `data` with `count`, `next`, `previous`, `results`
- Detail endpoints return `success`, `message`, and `data` with the entity payload.
- Create endpoints return `success`, `message`, and created entity details.
- Update endpoints return `success`, `message`, and updated entity details.
- Delete endpoints return `success` and a confirmation `message`.

## Frontend Compatibility Requirements

- Frontend data models must use UUID string IDs for all entities.
- Enum selects must use the exact enum values defined above.
- Forms must send field names exactly as the backend expects (`full_name`, `farm`, `role`, `salary`, `status`, `hire_date`, etc.).
- Endpoint base path is `/api/v1/` and must be preserved in API client config.
- Standard pagination query parameters are supported: `page`, `page_size`, filters such as `farm`, `status`, `role`.
- Styling should render lists and forms in a way that supports table row drilling, edit buttons, delete buttons, and detail views.

---

## Backend Status

This document represents the overall completed backend schema for the Poultry ERP system. The backend is designed to support:
- multi-farm operations
- RBAC-based access control
- audit logging
- transactional inventory and finance workflows
- paginated REST API consumption

The frontend schema and styling should be compatible with this backend by matching the entity structure, API contract, pagination format, and enumerated values.
