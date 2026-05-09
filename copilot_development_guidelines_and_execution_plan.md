# Copilot Development Guidelines & Execution Plan

# PURPOSE

This document defines:

1. Development order
2. System architecture rules
3. Backend structure
4. Frontend structure
5. Modular implementation rules
6. Database implementation rules
7. Copilot coding behavior instructions
8. Engineering standards
9. Scalability rules
10. File organization strategy

This document is the authoritative implementation guide for the entire Poultry ERP system.

All future development must align with:

- Database schema
- Business rules
- Permission engine
- Dashboard metrics
- API contracts
- Authentication flow
- Reporting rules

If any architecture document changes:

1. Review all affected modules
2. Update implementation
3. Update APIs
4. Update serializers
5. Update frontend logic
6. Update tests

Never implement isolated changes without checking architectural alignment.

---

# CORE DEVELOPMENT PRINCIPLES

## 1. Modular Architecture

The system MUST be modular.

NEVER place all models in:

```python
models.py
```

NEVER place all logic in one app.

Each business domain must be isolated.

---

## 2. Domain-Driven Structure

Every module must own:

- models
- serializers
- services
- selectors
- permissions
- views
- urls
- tests
- tasks
- validators

---

## 3. Service Layer Pattern

Business logic MUST NOT exist directly in views.

Views should:

- validate requests
- call services
- return responses

Complex logic belongs inside:

```python
services/
```

---

## 4. Selector Pattern

Database query logic should be isolated.

Use:

```python
selectors/
```

Selectors are responsible for:

- filtering
- optimized queries
- annotations
- dashboard aggregations
- reporting queries

---

## 5. Fat Database + Clean Services

Use PostgreSQL features properly:

- indexes
- constraints
- transactions
- aggregation
- JSONB
- foreign keys

Avoid weak data integrity.

---

## 6. RBAC Everywhere

Every endpoint must validate:

1. authentication
2. permissions
3. farm access
4. province access

No endpoint should bypass permission middleware.

---

# RECOMMENDED BACKEND STACK

## Core

- Django
- Django REST Framework
- PostgreSQL
- Redis
- Celery
- SimpleJWT
- Django Filter
- DRF Spectacular

---

## Infrastructure

- Docker
- Docker Compose
- Nginx
- Gunicorn
- GitHub Actions

---

## Frontend

- React
- TypeScript
- React Query
- Zustand
- TailwindCSS
- shadcn/ui
- Axios
- Recharts

---

# BACKEND PROJECT STRUCTURE

```text
backend/
│
├── apps/
│   │
│   ├── authentication/
│   ├── users/
│   ├── permissions/
│   ├── provinces/
│   ├── farms/
│   ├── employees/
│   ├── chickens/
│   ├── feed/
│   ├── finance/
│   ├── dashboards/
│   ├── reports/
│   ├── audit_logs/
│   ├── notifications/
│   └── common/
│
├── config/
│
├── requirements/
│
├── docker/
│
├── scripts/
│
└── manage.py
```

---

# APP INTERNAL STRUCTURE

Every app must follow this structure.

Example:

```text
apps/farms/
│
├── admin/
├── api/
│   ├── serializers/
│   ├── views/
│   ├── urls/
│   └── validators/
│
├── models/
├── services/
├── selectors/
├── permissions/
├── tasks/
├── tests/
├── migrations/
├── constants/
├── utils/
└── apps.py
```

---

# MODEL ORGANIZATION RULES

NEVER place all models inside one file.

Use:

```text
models/
```

Example:

```text
models/
├── province.py
├── farm.py
├── farm_access.py
└── __init__.py
```

Inside:

```python
# models/__init__.py
from .province import Province
from .farm import Farm
```

---

# SERIALIZER RULES

Separate serializers by responsibility.

Example:

```text
serializers/
├── create.py
├── update.py
├── detail.py
├── list.py
└── dashboard.py
```

Avoid massive serializers.

---

# SERVICE LAYER RULES

Services contain:

- transactional logic
- inventory logic
- finance calculations
- movement validation
- approval workflows

Example:

```python
create_chicken_movement()
approve_expense()
calculate_farm_profit()
```

---

# SELECTOR RULES

Selectors contain:

- optimized queryset logic
- reporting queries
- dashboard aggregation
- annotations
- caching hooks

Example:

```python
get_global_dashboard_metrics()
get_farm_feed_summary()
```

---

# DATABASE IMPLEMENTATION RULES

## 1. Implement Exact Schema

Implementation must follow architecture database schema exactly.

Do not:

- rename fields randomly
- skip constraints
- skip indexes
- skip foreign keys
- skip enums

---

## 2. UUID Primary Keys

All major entities use UUIDs.

---

## 3. Soft Deletes

Operational data should use:

```python
is_active
```

instead of hard deletion.

---

## 4. Timestamps

All entities require:

```python
created_at
updated_at
```

---

## 5. Transactions

Critical operations must use:

```python
transaction.atomic()
```

Especially:

- inventory updates
- finance updates
- chicken movements
- approval flows

---

# DJANGO MODEL STANDARDS

Every model should include:

```python
class Meta:
    db_table = "table_name"
    ordering = ["-created_at"]
```

---

# API IMPLEMENTATION RULES

## 1. Versioned APIs

Always use:

```text
/api/v1/
```

---

## 2. RESTful Naming

Correct:

```text
/api/v1/farms/
```

Avoid:

```text
/getAllFarms
```

---

## 3. Standard Responses

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

---

## 4. Pagination Required

All list endpoints must paginate.

---

## 5. Filtering Required

Use:

- Django Filter
- search
- ordering
- date filters

---

# AUTHENTICATION RULES

Use:

- JWT access tokens
- refresh tokens

Library:

```text
SimpleJWT
```

---

# PERMISSION IMPLEMENTATION RULES

Permission format:

```text
module.action
```

Examples:

```text
farms.view
farms.create
employees.update
reports.export
```

---

# PERMISSION CHECK FLOW

Every request checks:

1. JWT valid
2. user active
3. direct permission
4. role permission
5. farm access
6. province access

---

# AUDIT LOGGING RULES

All sensitive operations must generate audit logs.

Examples:

- create farm
- delete employee
- approve expense
- modify permissions
- export reports

---

# REDIS USAGE RULES

Use Redis for:

- dashboard caching
- permission caching
- celery broker
- rate limiting
- session optimization

---

# CELERY USAGE RULES

Use Celery for:

- report exports
- scheduled reports
- analytics recalculation
- notifications
- cleanup jobs

Never execute long-running tasks in API requests.

---

# FRONTEND STRUCTURE

```text
frontend/
│
├── src/
│   ├── api/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── store/
│   ├── types/
│   ├── utils/
│   └── constants/
```

---

# FRONTEND RULES

## 1. Feature-Based Structure

Group by feature.

Avoid:

```text
all components in one folder
```

---

## 2. API Layer

Centralize Axios configuration.

Use interceptors for:

- JWT refresh
- auth handling
- error handling

---

## 3. React Query

Use React Query for:

- server state
- caching
- retries
- synchronization

---

## 4. Zustand

Use Zustand for:

- auth state
- sidebar state
- filters
- UI preferences

---

# DEVELOPMENT ORDER

# PHASE 1 — FOUNDATION

## Step 1
Initialize:

- Django
- PostgreSQL
- Docker
- DRF
- SimpleJWT
- Redis
- Celery

---

## Step 2
Create:

- custom user model
- authentication app
- RBAC system
- permission engine

---

## Step 3
Implement:

- roles
- permissions
- user roles
- user permissions
- farm access
- province access

---

# PHASE 2 — CORE STRUCTURE

## Step 4
Implement:

- provinces
- farms
- dashboards base

---

## Step 5
Implement:

- employees
- salaries
- employee APIs

---

# PHASE 3 — OPERATIONS

## Step 6
Implement:

- chicken batches
- chicken movements
- inventory calculations

---

## Step 7
Implement:

- feed inventory
- feed transactions
- feed consumption logic

---

# PHASE 4 — FINANCE

## Step 8
Implement:

- expenses
- income
- capital
- approval workflow

---

## Step 9
Implement:

- finance dashboards
- profitability calculations
- financial summaries

---

# PHASE 5 — REPORTING

## Step 10
Implement:

- reports
- exports
- analytics
- charts

---

## Step 11
Implement:

- audit logs
- notifications
- activity feeds

---

# PHASE 6 — OPTIMIZATION

## Step 12
Implement:

- Redis caching
- query optimization
- Celery jobs
- background processing

---

## Step 13
Implement:

- monitoring
- backups
- CI/CD
- production deployment

---

# COPILOT IMPLEMENTATION RULES

When generating code:

1. Follow modular architecture.
2. Follow business rules.
3. Follow API contracts.
4. Follow RBAC rules.
5. Follow database schema.
6. Use service layer.
7. Use selectors.
8. Use transactions.
9. Generate clean scalable code.
10. Avoid monolithic files.
11. Avoid duplicated logic.
12. Prefer reusable abstractions.
13. Use type-safe patterns.
14. Use optimized queries.
15. Generate production-ready code.

---

# ENGINEERING RULES

## NEVER

- put all logic in views
- put all models in one file
- hardcode permissions
- bypass validation
- bypass RBAC
- skip audit logs
- duplicate query logic
- calculate metrics in frontend

---

## ALWAYS

- validate data
- use services
- use selectors
- use transactions
- use permissions
- use pagination
- use filters
- use indexes
- use caching
- write scalable code

---

# FINAL IMPLEMENTATION STRATEGY

The system must evolve as:

1. modular
2. scalable
3. enterprise-ready
4. RBAC-secured
5. analytics-driven
6. API-first
7. maintainable
8. auditable
9. production-grade

All future development must align with this implementation guide.

