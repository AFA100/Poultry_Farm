# Poultry ERP System Architecture Blueprint

## Technology Stack

### Backend
- Django
- Django REST Framework (DRF)
- PostgreSQL
- Redis
- Celery
- JWT Authentication
- Django SimpleJWT
- Django Filter
- DRF Spectacular (Swagger/OpenAPI)
- Gunicorn
- Nginx
- Docker

### Frontend
- React
- TypeScript
- React Router
- Axios
- Zustand or Redux Toolkit
- React Query / TanStack Query
- TailwindCSS
- shadcn/ui
- Recharts

### Infrastructure
- Docker Compose
- PostgreSQL backups
- Redis caching
- S3-compatible storage for exports/files
- CI/CD pipeline
- HTTPS SSL

---

# 1. BUSINESS RULES

## 1.1 Global Rules

1. Every farm must belong to exactly one province.
2. Every employee must belong to exactly one farm.
3. Every operational transaction must belong to one farm.
4. No inventory quantity can become negative.
5. No financial amount can be negative.
6. Every record must contain timestamps.
7. Soft deletion is preferred over hard deletion for operational data.
8. All sensitive actions must create audit logs.
9. System data must be immutable after approval where applicable.
10. Historical data must never be silently modified.

---

## 1.2 Province Rules

1. Province names must be unique.
2. Province deletion is forbidden if farms exist.
3. Provinces can be marked inactive.
4. Province admins may only access assigned provinces.

---

## 1.3 Farm Rules

1. Farm names must be unique within the same province.
2. Farms have maximum capacity.
3. Chicken quantity must never exceed farm capacity.
4. Farms can be archived but not hard deleted.
5. Farm managers may only access assigned farms.
6. All farm operations must be logged.

---

## 1.4 Employee Rules

1. Employees belong to one farm only.
2. Salary cannot be negative.
3. Inactive employees cannot receive operational assignments.
4. Historical salary records must be preserved.
5. Employees may not access system unless explicitly created as users.
6. Employee deletion is forbidden if historical financial records exist.

---

## 1.5 Chicken Batch Rules

1. Every chicken entry creates a batch.
2. Every chicken movement must reference a batch.
3. OUT movement cannot exceed available batch quantity.
4. Batch quantity can never become negative.
5. Chicken movements are immutable after approval.
6. Every movement must include reason.
7. Mortality must be tracked as OUT movement with reason=mortality.
8. Transfer between farms requires paired OUT and IN transactions.

---

## 1.6 Feed Inventory Rules

1. Feed inventory cannot become negative.
2. Feed transactions are source of truth.
3. Feed inventory snapshot is derived from transactions.
4. Feed units must be standardized.
5. System supports:
   - bag
   - kg
6. Unit conversion must be configurable.
7. Feed consumption reports use transaction history only.

---

## 1.7 Expense Rules

1. Expenses require category.
2. Expenses require farm.
3. Expenses cannot be negative.
4. Approved expenses become immutable.
5. Deleted expenses must remain in audit logs.
6. Expense editing after approval requires elevated permission.

---

## 1.8 Income Rules

1. Income requires source.
2. Income cannot be negative.
3. Approved income becomes immutable.
4. Income entries must belong to farms.
5. All income changes must be audited.

---

## 1.9 Capital Rules

1. Capital is separate from income.
2. Capital represents investment only.
3. Capital modifications require approval.
4. Capital history must remain immutable.

---

## 1.10 Audit Rules

1. All create/update/delete actions generate audit logs.
2. Audit logs cannot be edited.
3. Audit logs cannot be deleted.
4. Audit logs must contain:
   - user
   - action
   - entity
   - timestamp
   - metadata

---

# 2. PERMISSION ENGINE

## 2.1 RBAC Architecture

Authorization hierarchy:

User -> Roles -> Permissions
User -> Direct Permissions
User -> Farm Access
User -> Province Access

---

## 2.2 Permission Format

Pattern:

module.action

Examples:

farms.view
farms.create
employees.update
reports.export

---

## 2.3 System Modules

1. dashboard
2. provinces
3. farms
4. employees
5. chickens
6. feed
7. expenses
8. income
9. capital
10. reports
11. users
12. roles
13. permissions
14. settings
15. audit_logs

---

## 2.4 Standard Actions

1. view
2. create
3. update
4. delete
5. approve
6. export
7. manage
8. archive

---

## 2.5 Permission Evaluation Order

1. Check authentication.
2. Check account active.
3. Check direct user permissions.
4. Check role permissions.
5. Check farm/province scope.
6. Grant or deny.

---

## 2.6 Scope Rules

### Super Admin
- Full access.

### Province Admin
- Assigned provinces only.

### Farm Manager
- Assigned farms only.

### Worker
- Limited operational access.

---

## 2.7 Permission Middleware Logic

Every API request checks:

1. JWT valid?
2. User active?
3. Permission exists?
4. User has permission?
5. User has farm/province access?
6. Request allowed.

---

## 2.8 Sensitive Permissions

Restricted:

- permissions.manage
- roles.manage
- users.delete
- reports.export
- finance.approve
- settings.manage

---

## 2.9 Recommended Django Structure

Use:

- Custom permission classes
- DRF permission middleware
- Centralized permission service
- Cached permission resolution

---

# 3. DASHBOARD METRICS

## 3.1 Global Dashboard Metrics

### Total Provinces
COUNT(provinces)

### Total Farms
COUNT(farms)

### Total Employees
COUNT(employees WHERE active)

### Total Chickens
SUM(IN movements) - SUM(OUT movements)

### Total Feed Remaining
SUM(feed IN) - SUM(feed OUT)

### Total Expenses
SUM(expenses.amount)

### Total Income
SUM(income.amount)

### Total Capital
SUM(capital.amount)

### Net Profit
Total Income - Total Expenses

---

## 3.2 Province Dashboard Metrics

Filtered by province.

Includes:
- farms
- employees
- chicken count
- feed remaining
- expenses
- income
- profit

---

## 3.3 Farm Dashboard Metrics

Filtered by farm.

Includes:
- live chickens
- feed stock
- mortality
- monthly expenses
- income
- payroll obligations
- profit

---

## 3.4 Activity Dashboard

Sources:

- chicken movements
- feed transactions
- expenses
- income
- employee changes

Sorted descending by created_at.

---

## 3.5 KPI Rules

1. Metrics must be real-time where possible.
2. Metrics use transaction tables as source of truth.
3. Cached metrics must refresh automatically.
4. All dashboards support filtering:
   - date range
   - province
   - farm

---

## 3.6 Analytics Rules

Future support:

- mortality trends
- feed efficiency
- farm comparison
- profitability trends
- operational forecasting

---

# 4. API CONTRACTS

## 4.1 API Standards

Base URL:

/api/v1/

Rules:

1. JSON only.
2. RESTful naming.
3. Standard response structure.
4. JWT authentication.
5. Pagination required.
6. Filtering supported.
7. Sorting supported.

---

## 4.2 Standard Response Structure

Success:

{
  "success": true,
  "message": "Success",
  "data": {}
}

Error:

{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}

---

## 4.3 Authentication APIs

POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET /api/v1/auth/me
POST /api/v1/auth/change-password

---

## 4.4 Province APIs

GET /api/v1/provinces
POST /api/v1/provinces
GET /api/v1/provinces/:id
PUT /api/v1/provinces/:id
DELETE /api/v1/provinces/:id
GET /api/v1/provinces/:id/dashboard

---

## 4.5 Farm APIs

GET /api/v1/farms
POST /api/v1/farms
GET /api/v1/farms/:id
PUT /api/v1/farms/:id
DELETE /api/v1/farms/:id
GET /api/v1/farms/:id/dashboard
GET /api/v1/farms/:id/activity

---

## 4.6 Employee APIs

GET /api/v1/employees
POST /api/v1/employees
GET /api/v1/employees/:id
PUT /api/v1/employees/:id
DELETE /api/v1/employees/:id

---

## 4.7 Chicken APIs

GET /api/v1/chicken-batches
POST /api/v1/chicken-batches
GET /api/v1/chicken-movements
POST /api/v1/chicken-movements

---

## 4.8 Feed APIs

GET /api/v1/feed-inventory
GET /api/v1/feed-transactions
POST /api/v1/feed-transactions

---

## 4.9 Finance APIs

GET /api/v1/expenses
POST /api/v1/expenses
GET /api/v1/income
POST /api/v1/income
GET /api/v1/capital
POST /api/v1/capital

---

## 4.10 User & RBAC APIs

GET /api/v1/users
POST /api/v1/users
GET /api/v1/roles
POST /api/v1/roles
GET /api/v1/permissions
GET /api/v1/permission-groups

---

## 4.11 Reporting APIs

GET /api/v1/reports/profit-loss
GET /api/v1/reports/feed-consumption
GET /api/v1/reports/chicken-movements
GET /api/v1/reports/mortality

---

## 4.12 API Validation Rules

1. All UUIDs validated.
2. Farm scope validated.
3. Province scope validated.
4. Permission checks mandatory.
5. Serializer validation required.
6. Rate limiting on auth APIs.

---

# 5. AUTHENTICATION FLOW

## 5.1 Authentication Method

Use:

- JWT access token
- JWT refresh token

Library:

- Django SimpleJWT

---

## 5.2 Login Flow

1. User submits email/password.
2. Backend validates credentials.
3. Access token issued.
4. Refresh token issued.
5. Frontend stores tokens securely.

---

## 5.3 Token Lifetime

### Access Token
15 minutes

### Refresh Token
7 days

---

## 5.4 Logout Flow

1. Refresh token blacklisted.
2. Frontend clears session.

---

## 5.5 Password Rules

1. Minimum 8 characters.
2. Strong password validation.
3. Password hashing using Django built-ins.
4. Password reset via email.

---

## 5.6 Security Rules

1. HTTPS only.
2. CSRF protection.
3. Rate limiting.
4. Account lock after repeated failures.
5. Session invalidation on password change.
6. Audit login attempts.

---

## 5.7 Multi-Device Rules

1. Multiple sessions allowed.
2. Super admin may revoke sessions.
3. Session management planned for future.

---

# 6. REPORTING RULES

## 6.1 General Reporting Rules

1. Reports use transactional data only.
2. Reports are immutable snapshots.
3. Deleted records excluded unless archived.
4. Reports must support date ranges.
5. Reports must support province/farm filters.

---

## 6.2 Financial Reports

### Profit/Loss Formula

Profit = Income - Expenses

Capital excluded from profit.

---

## 6.3 Chicken Reports

### Current Chickens

SUM(IN) - SUM(OUT)

### Mortality

OUT movements where reason=mortality

### Farm Performance

Compare:
- growth
- mortality
- profitability

---

## 6.4 Feed Reports

### Feed Remaining

SUM(IN) - SUM(OUT)

### Consumption Rate

Feed used / chicken count

---

## 6.5 Payroll Reports

Total salaries grouped by:

- farm
- province
- month

---

## 6.6 Export Rules

Supported:

- PDF
- Excel
- CSV

Exports require:

reports.export permission

---

## 6.7 Time Definitions

### Daily
00:00 -> 23:59

### Monthly
Calendar month

### Yearly
Calendar year

---

## 6.8 Historical Integrity

1. Historical reports must remain reproducible.
2. Approved transactions remain immutable.
3. Audit logs preserved permanently.

---

# RECOMMENDED DJANGO PROJECT STRUCTURE

backend/
├── apps/
│   ├── authentication/
│   ├── users/
│   ├── permissions/
│   ├── provinces/
│   ├── farms/
│   ├── employees/
│   ├── chickens/
│   ├── feed/
│   ├── finance/
│   ├── reports/
│   ├── dashboards/
│   ├── audit_logs/
│   └── common/
│
├── config/
├── requirements/
├── docker/
└── manage.py

---

# RECOMMENDED DEVELOPMENT ORDER

## PHASE 1
- Database
- Authentication
- RBAC
- Users
- Provinces
- Farms

## PHASE 2
- Employees
- Chicken operations
- Feed inventory

## PHASE 3
- Expenses
- Income
- Capital
- Dashboards

## PHASE 4
- Reporting
- Analytics
- Audit systems
- Notifications

## PHASE 5
- Mobile optimization
- Forecasting
- Automation
- AI analytics

