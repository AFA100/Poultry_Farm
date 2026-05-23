\# Poultry ERP — Complete System Functionality Reference



> \*\*Purpose:\*\* This is the single source of truth for everything this system does — every module, every feature, every data flow. Written for developers building, extending, or connecting this system to an external backend (Laravel or Django).



\---



\## Table of Contents



1\. \[System Overview](#1-system-overview)

2\. \[Module Breakdown — Full Functionality](#2-module-breakdown--full-functionality)

&#x20;  - 2.1 \[Dashboard](#21-dashboard)

&#x20;  - 2.2 \[Provinces](#22-provinces)

&#x20;  - 2.3 \[Farms](#23-farms)

&#x20;  - 2.4 \[Employees](#24-employees)

&#x20;  - 2.5 \[Chicken Batches \& Movements](#25-chicken-batches--movements)

&#x20;  - 2.6 \[Feed Management](#26-feed-management)

&#x20;  - 2.7 \[Finance](#27-finance)

&#x20;  - 2.8 \[Reports](#28-reports)

&#x20;  - 2.9 \[Audit Log](#29-audit-log)

&#x20;  - 2.10 \[Access Control (RBAC)](#210-access-control-rbac)

&#x20;  - 2.11 \[User Management](#211-user-management)

3\. \[Data Entity Reference](#3-data-entity-reference)

4\. \[Authentication \& Authorization Summary](#4-authentication--authorization-summary)

5\. \[Connecting to a Laravel or Django Backend](#5-connecting-to-a-laravel-or-django-backend)

&#x20;  - 5.1 \[What the Frontend Does vs What the Backend Does](#51-what-the-frontend-does-vs-what-the-backend-does)

&#x20;  - 5.2 \[API Contract the Backend Must Implement](#52-api-contract-the-backend-must-implement)

&#x20;  - 5.3 \[Authentication Integration](#53-authentication-integration)

&#x20;  - 5.4 \[RBAC Integration](#54-rbac-integration)

&#x20;  - 5.5 \[Laravel-Specific Guide](#55-laravel-specific-guide)

&#x20;  - 5.6 \[Django-Specific Guide](#56-django-specific-guide)

&#x20;  - 5.7 \[Frontend Changes Required to Switch to External Backend](#57-frontend-changes-required-to-switch-to-external-backend)

&#x20;  - 5.8 \[Connection Map — What Connects to What](#58-connection-map--what-connects-to-what)



\---



\## 1. System Overview



The \*\*Poultry ERP\*\* is a multi-farm, multi-province enterprise management system for poultry operations. It handles:



\- Geographic organization (Provinces → Farms)

\- Personnel management (Employees per Farm)

\- Flock lifecycle (Chicken Batches → Movements: IN/OUT)

\- Feed logistics (Inventory + Transactions: IN/OUT)

\- Financial operations (Expenses + Income + Capital investments per Farm)

\- Role-Based Access Control (Permissions → Groups → Roles → Users)

\- Full audit trail of every data change



\*\*Users:\*\*

\- \*\*Super Admin\*\* (`role: "admin"`) — full access to all modules including User Management and Access Control

\- \*\*Regular User\*\* (`role: "user"`) — access controlled entirely by RBAC role assignments



\*\*Tech Stack:\*\* React 18 + Tailwind CSS + shadcn/ui + Base44 SDK (BaaS) currently. Designed to be replaceable with a custom Laravel or Django backend.



\---



\## 2. Module Breakdown — Full Functionality



\---



\### 2.1 Dashboard



\*\*Route:\*\* `/`



\*\*What it does:\*\*

\- Displays high-level KPI cards: total farms, total employees, total chicken count, total feed stock

\- Shows financial summary: total income, total expenses, net profit across all farms

\- Displays recent activity or chart of farm performance over time

\- Acts as the home landing page after login



\*\*Data it reads:\*\*

\- `Farm` — count, active/inactive

\- `Employee` — count

\- `ChickenBatch` — total quantity across active batches

\- `FeedInventory` — total quantity

\- `Expense`, `Income`, `Capital` — summed for financial cards



\*\*No write operations on this page.\*\* Read-only aggregate view.



\---



\### 2.2 Provinces



\*\*No dedicated route\*\* — managed inline within the Farms page or via direct entity management.



\*\*What it does:\*\*

\- Provides the geographic top-level grouping

\- Each Province has a `name` and `is\_active` flag

\- Farms belong to a Province via `province\_id`

\- Used in RBAC scoping: Permission Groups can be restricted to specific Province IDs



\*\*CRUD:\*\* Create, Read, Update, deactivate (soft delete via `is\_active`)



\---



\### 2.3 Farms



\*\*Route:\*\* `/farms`



\*\*What it does:\*\*

\- Lists all farm records in a searchable, filterable data table

\- Super admin or authorized users can create, edit, and deactivate farms

\- Each farm belongs to a Province

\- Farm records serve as the foreign key for Employees, Chicken Batches, Feed Inventory, Feed Transactions, Expenses, Income, and Capital



\*\*Fields:\*\* `name`, `province\_id`, `location`, `capacity` (max chicken count), `is\_active`



\*\*CRUD operations:\*\*

\- \*\*Create\*\* — opens FarmFormDialog, fills Province dropdown (from Province list), name, location, capacity

\- \*\*Edit\*\* — same dialog pre-filled with existing data

\- \*\*Deactivate\*\* — sets `is\_active: false` (soft delete, record remains)

\- \*\*Delete\*\* — hard delete via trash icon with AlertDialog confirmation



\*\*Stats shown:\*\* Total farms, Active farms, Total capacity



\---



\### 2.4 Employees



\*\*Route:\*\* `/employees`



\*\*What it does:\*\*

\- Manages all staff records across all farms

\- Employees are linked to a specific farm via `farm\_id`

\- Supports three roles: `farmer`, `worker`, `manager`

\- Tracks hire date, salary, and active/inactive status

\- Color-coded status badges: green=active, grey=inactive; emerald=farmer, blue=worker, purple=manager



\*\*Fields:\*\* `full\_name`, `farm\_id`, `role` (farmer/worker/manager), `salary`, `hire\_date`, `status` (active/inactive), `is\_active`



\*\*CRUD operations:\*\*

\- \*\*Create\*\* — EmployeeFormDialog: select farm, enter name, role, hire date, salary, status

\- \*\*Edit\*\* — same dialog in edit mode

\- \*\*Delete\*\* — with AlertDialog confirmation



\*\*Filters:\*\* Search by name, filter by farm, filter by role, filter by status



\*\*Stats shown:\*\* Total employees, Managers count, Active employees



\---



\### 2.5 Chicken Batches \& Movements



\*\*Route:\*\* `/chickens`



\*\*Tabbed page — two tabs:\*\*



\#### Tab 1: Batches



\*\*What it does:\*\*

\- Tracks each group (batch) of chickens that entered a farm

\- Records entry date, source/supplier, cost per bird, initial quantity, status

\- Status: `active` (birds still on farm) or `inactive` (batch closed/sold out)



\*\*Fields:\*\* `farm\_id`, `quantity`, `entry\_date`, `source`, `cost\_per\_unit`, `status`



\*\*CRUD:\*\* Create, Edit, Delete batches



\#### Tab 2: Movements



\*\*What it does:\*\*

\- Records every IN or OUT movement of birds for a specific batch on a specific farm

\- `IN` = new birds added to a batch (e.g. transfers, supplemental purchases)

\- `OUT` = birds removed from a batch (e.g. sales, mortality, transfers to another farm)

\- Provides a full transaction history of flock changes



\*\*Fields:\*\* `farm\_id`, `batch\_id`, `type` (IN/OUT), `quantity`, `movement\_date`, `reason`



\*\*CRUD:\*\* Create movement (select farm → batch auto-filters by farm), Edit, Delete



\*\*Stats shown:\*\* Total batches, Active batches, Total birds in system, Total movements



\---



\### 2.6 Feed Management



\*\*Route:\*\* `/feed`



\*\*Tabbed page — two tabs:\*\*



\#### Tab 1: Inventory



\*\*What it does:\*\*

\- Shows the current feed stock level per farm

\- One FeedInventory record per farm (unique per farm)

\- Unit can be `bag` or `kg`

\- This record is updated as transactions come in — it is the running balance



\*\*Fields:\*\* `farm\_id`, `quantity`, `unit`



\*\*CRUD:\*\* Create inventory record for a farm, Edit quantity, Delete



\#### Tab 2: Transactions



\*\*What it does:\*\*

\- Records every feed movement: `IN` (purchase/delivery) or `OUT` (consumption/usage)

\- Provides full audit trail of feed logistics

\- Each transaction references the farm and the date



\*\*Fields:\*\* `farm\_id`, `type` (IN/OUT), `quantity`, `unit`, `transaction\_date`, `note`



\*\*CRUD:\*\* Create, Edit, Delete transactions



\*\*Stats shown:\*\* Total farms with inventory, Total feed stock (aggregated), Recent transactions count



\*\*Business logic note:\*\* The FeedInventory `quantity` should be updated whenever a FeedTransaction is created. `IN` adds to inventory, `OUT` subtracts. This logic must be implemented either on the frontend (update inventory after creating a transaction) or enforced via backend triggers/signals.



\---



\### 2.7 Finance



\*\*Route:\*\* `/finance`



\*\*Tabbed page — three tabs:\*\*



\#### Tab 1: Expenses



\*\*What it does:\*\*

\- Records all money going OUT of the operation per farm

\- Categories are free-text (e.g. "Veterinary", "Fuel", "Repairs")

\- Supports filtering by farm and date range



\*\*Fields:\*\* `farm\_id`, `category`, `amount`, `expense\_date`, `description`, `is\_active`



\*\*CRUD:\*\* Create, Edit, Delete expenses



\#### Tab 2: Income



\*\*What it does:\*\*

\- Records all money coming IN per farm

\- Source is free-text (e.g. "Egg Sales", "Chicken Sales", "Manure Sales")



\*\*Fields:\*\* `farm\_id`, `source`, `amount`, `income\_date`, `description`, `is\_active`



\*\*CRUD:\*\* Create, Edit, Delete income records



\#### Tab 3: Capital



\*\*What it does:\*\*

\- Records capital investments into a farm (not recurring income — one-time or periodic investments by owners)

\- Separate from income so financial reports can distinguish operating revenue from investment capital



\*\*Fields:\*\* `farm\_id`, `amount`, `investment\_date`, `note`, `is\_active`



\*\*CRUD:\*\* Create, Edit, Delete capital records



\*\*Stats shown:\*\* Total expenses, Total income, Total capital, Net profit (income - expenses)



\---



\### 2.8 Reports



\*\*Route:\*\* `/reports`



\*\*What it does:\*\*

\- Provides aggregated analytics and visual charts across all modules

\- Farm performance comparison (income vs expenses per farm)

\- Flock trends (chicken count over time)

\- Feed consumption trends

\- Financial summary with profit/loss

\- Date range filtering



\*\*Data it reads:\*\* All entities — Farms, Employees, ChickenBatches, ChickenMovements, FeedInventory, FeedTransactions, Expenses, Income, Capital



\*\*No write operations.\*\* Read-only analytics view.



\*\*Charts used:\*\* Bar charts, Line charts, Pie/Donut charts (via Recharts)



\---



\### 2.9 Audit Log



\*\*Route:\*\* `/audit-log`



\*\*What it does:\*\*

\- Stores a record of every significant action in the system

\- Each log entry captures: who did it (`user\_id`), what action (`create`, `update`, `delete`), which entity type (`entity\_name`), which specific record (`entity\_id`), and optional details (`metadata` as JSON string)

\- Displayed as a read-only, time-sorted table

\- Supports filtering by action type, entity name, and date



\*\*Fields:\*\* `user\_id`, `action`, `entity\_name`, `entity\_id`, `metadata`



\*\*No write operations from the UI.\*\* Logs are created programmatically when other CRUD operations succeed.



\*\*How logs are created:\*\* After every successful `create`, `update`, or `delete` mutation, the frontend (or backend) writes an AuditLog record. Example:

```js

await base44.entities.AuditLog.create({

&#x20; user\_id: currentUser.id,

&#x20; action: "create",

&#x20; entity\_name: "Farm",

&#x20; entity\_id: newFarm.id,

&#x20; metadata: JSON.stringify({ name: newFarm.name }),

});

```



\---



\### 2.10 Access Control (RBAC)



\*\*Route:\*\* `/access-control`

\*\*Visible to:\*\* Admin users only



\*\*Tabbed page — four tabs:\*\*



\#### Tab 1: Permissions



\- Lists all atomic permission records

\- Each permission = one action on one module (e.g. `farms:read`, `finance:write`)

\- Fields: `name` (unique key), `label`, `module`, `action`, `description`

\- CRUD: Create, Edit, Delete



\#### Tab 2: Permission Groups



\- Groups one or more permissions together with an optional data scope

\- Scope types: `global` (all data), `province` (restricted to selected provinces), `farm` (restricted to selected farms)

\- Fields: `name`, `description`, `permission\_ids\[]`, `scope\_type`, `scope\_ids\[]`, `is\_active`

\- CRUD: Create, Edit, Delete



\#### Tab 3: Roles



\- Bundles permission groups into a named role (e.g. "Farm Manager" = Farm Viewers group + Employee Readers group)

\- Fields: `name`, `description`, `permission\_group\_ids\[]`, `is\_active`

\- CRUD: Create, Edit, Delete



\#### Tab 4: User Assignments



\- Links a user account to one or more Roles

\- One UserRole record per user — holds all roles as an array

\- Fields: `user\_id`, `user\_email`, `role\_ids\[]`, `notes`, `is\_active`

\- CRUD: Create assignment, Edit (change roles), Delete assignment



\*\*Permission check chain:\*\*

```

UserRole.role\_ids → Role.permission\_group\_ids → PermissionGroup.permission\_ids → Permission.name

```



\---



\### 2.11 User Management



\*\*Route:\*\* `/user-management`

\*\*Visible to:\*\* Admin users only



\*\*What it does:\*\*

\- Lists all user accounts in the system

\- Stats: total users, admin count, regular user count

\- Search by name or email, filter by role

\- Create new user accounts directly (no email invite — account created immediately)

\- Change any user's base role (`admin` ↔ `user`) inline

\- Delete user accounts with confirmation



\*\*Fields (User entity):\*\* `id`, `email`, `full\_name`, `role` (admin/user), `created\_date`



\*\*CRUD:\*\*

\- \*\*Create\*\* — CreateUserDialog: full name, email, password (min 8 chars), role

\- \*\*Edit role\*\* — inline Select dropdown, saves immediately on change

\- \*\*Delete\*\* — trash icon on hover, AlertDialog confirmation



\---



\## 3. Data Entity Reference



| Entity | Purpose | Key Relations |

|---|---|---|

| `Province` | Geographic grouping | Parent of Farm |

| `Farm` | Core operational unit | Child of Province; Parent of all below |

| `Employee` | Staff per farm | `farm\_id` → Farm |

| `ChickenBatch` | Flock group | `farm\_id` → Farm |

| `ChickenMovement` | Bird IN/OUT events | `farm\_id` → Farm, `batch\_id` → ChickenBatch |

| `FeedInventory` | Current feed stock per farm | `farm\_id` → Farm (unique) |

| `FeedTransaction` | Feed IN/OUT events | `farm\_id` → Farm |

| `Expense` | Outgoing money per farm | `farm\_id` → Farm |

| `Income` | Incoming money per farm | `farm\_id` → Farm |

| `Capital` | Investment per farm | `farm\_id` → Farm |

| `AuditLog` | System action history | `user\_id` → User (optional) |

| `Permission` | Atomic RBAC permission | Standalone |

| `PermissionGroup` | Bundle of permissions with scope | `permission\_ids\[]` → Permission |

| `Role` | Bundle of permission groups | `permission\_group\_ids\[]` → PermissionGroup |

| `UserRole` | User-to-role assignment | `user\_id` → User, `role\_ids\[]` → Role |



\---



\## 4. Authentication \& Authorization Summary



| Layer | Mechanism | Stored Where | Enforced By |

|---|---|---|---|

| Authentication | Session token (JWT) | Browser / Auth provider | `ProtectedRoute`, `AuthProvider` |

| Base Role | `User.role` = "admin" or "user" | User entity | Sidebar visibility + page-level redirect |

| Fine-grained RBAC | UserRole → Role → PermissionGroup → Permission | 4 entities in DB | `userHasPermission()` utility + conditional rendering |



\*\*Rule:\*\* A user must pass all three layers to act on any data.



\---



\## 5. Connecting to a Laravel or Django Backend



This section explains exactly how to replace the Base44 BaaS with a custom backend built in \*\*Laravel\*\* or \*\*Django\*\*, and what each side is responsible for.



\---



\### 5.1 What the Frontend Does vs What the Backend Does



| Concern | Frontend (React) | Backend (Laravel/Django) |

|---|---|---|

| Render UI | ✅ All rendering | ❌ No rendering |

| API calls | ✅ Sends HTTP requests | ❌ Receives and processes them |

| Authentication token | ✅ Stores token, sends in `Authorization` header | ✅ Issues token (JWT), validates on each request |

| User session state | ✅ Reads token, populates `currentUser` | ✅ `/api/auth/me` returns current user |

| Data validation | ✅ Client-side (form UX only) | ✅ Server-side (authoritative, security-critical) |

| RBAC enforcement | ✅ Hides UI elements | ✅ Filters query results, rejects unauthorized mutations |

| Database queries | ❌ Never directly | ✅ All DB access via Eloquent (Laravel) or ORM (Django) |

| Business logic | ⚠️ Light (e.g. filter, compute totals) | ✅ All critical logic (e.g. inventory balance updates) |

| File storage | ❌ Sends file to backend | ✅ Stores files, returns URL |



\*\*Golden rule:\*\* The frontend is a display and input layer only. Every security-critical decision must be enforced by the backend.



\---



\### 5.2 API Contract the Backend Must Implement



All endpoints follow this convention:



\*\*Base URL:\*\* `https://your-backend-domain.com/api/v1/`



\*\*Auth header (required on all protected endpoints):\*\*

```

Authorization: Bearer <jwt\_token>

```



\*\*Standard list response:\*\*

```json

{

&#x20; "success": true,

&#x20; "message": "OK",

&#x20; "data": {

&#x20;   "count": 42,

&#x20;   "next": "?page=2",

&#x20;   "previous": null,

&#x20;   "results": \[ { ...entity }, { ...entity } ]

&#x20; }

}

```



\*\*Standard single-record response (create/update/get):\*\*

```json

{

&#x20; "success": true,

&#x20; "message": "Created.",

&#x20; "data": { ...entity }

}

```



\*\*Standard delete response:\*\*

```json

{

&#x20; "success": true,

&#x20; "message": "Deleted."

}

```



\*\*Standard error response:\*\*

```json

{

&#x20; "success": false,

&#x20; "message": "Validation failed.",

&#x20; "errors": { "field": \["Error message."] }

}

```



\---



\#### Full Endpoint List



| Method | Endpoint | Description |

|---|---|---|

| POST | `/api/auth/login` | Login with email + password, returns JWT |

| POST | `/api/auth/register` | Register new user account |

| POST | `/api/auth/logout` | Invalidate token |

| GET | `/api/auth/me` | Get current authenticated user |

| PUT | `/api/auth/me` | Update current user profile |

| POST | `/api/auth/forgot-password` | Send password reset email |

| POST | `/api/auth/reset-password` | Reset password with token |

| | | |

| GET | `/api/v1/provinces` | List all provinces |

| POST | `/api/v1/provinces` | Create province |

| GET | `/api/v1/provinces/{id}` | Get one province |

| PUT | `/api/v1/provinces/{id}` | Update province |

| DELETE | `/api/v1/provinces/{id}` | Delete province |

| | | |

| GET | `/api/v1/farms` | List farms (filter: `?province\_id=`, `?is\_active=`) |

| POST | `/api/v1/farms` | Create farm |

| GET | `/api/v1/farms/{id}` | Get one farm |

| PUT | `/api/v1/farms/{id}` | Update farm |

| DELETE | `/api/v1/farms/{id}` | Delete farm |

| | | |

| GET | `/api/v1/employees` | List employees (filter: `?farm\_id=`, `?role=`, `?status=`) |

| POST | `/api/v1/employees` | Create employee |

| GET | `/api/v1/employees/{id}` | Get one employee |

| PUT | `/api/v1/employees/{id}` | Update employee |

| DELETE | `/api/v1/employees/{id}` | Delete employee |

| | | |

| GET | `/api/v1/chicken-batches` | List batches (filter: `?farm\_id=`, `?status=`) |

| POST | `/api/v1/chicken-batches` | Create batch |

| GET | `/api/v1/chicken-batches/{id}` | Get one batch |

| PUT | `/api/v1/chicken-batches/{id}` | Update batch |

| DELETE | `/api/v1/chicken-batches/{id}` | Delete batch |

| | | |

| GET | `/api/v1/chicken-movements` | List movements (filter: `?farm\_id=`, `?batch\_id=`, `?type=`) |

| POST | `/api/v1/chicken-movements` | Create movement |

| GET | `/api/v1/chicken-movements/{id}` | Get one movement |

| PUT | `/api/v1/chicken-movements/{id}` | Update movement |

| DELETE | `/api/v1/chicken-movements/{id}` | Delete movement |

| | | |

| GET | `/api/v1/feed-inventory` | List inventory records (filter: `?farm\_id=`) |

| POST | `/api/v1/feed-inventory` | Create inventory record |

| GET | `/api/v1/feed-inventory/{id}` | Get one record |

| PUT | `/api/v1/feed-inventory/{id}` | Update record |

| DELETE | `/api/v1/feed-inventory/{id}` | Delete record |

| | | |

| GET | `/api/v1/feed-transactions` | List transactions (filter: `?farm\_id=`, `?type=`) |

| POST | `/api/v1/feed-transactions` | Create transaction (+ auto-update FeedInventory) |

| GET | `/api/v1/feed-transactions/{id}` | Get one transaction |

| PUT | `/api/v1/feed-transactions/{id}` | Update transaction |

| DELETE | `/api/v1/feed-transactions/{id}` | Delete transaction |

| | | |

| GET | `/api/v1/expenses` | List expenses (filter: `?farm\_id=`, `?category=`) |

| POST | `/api/v1/expenses` | Create expense |

| GET | `/api/v1/expenses/{id}` | Get one expense |

| PUT | `/api/v1/expenses/{id}` | Update expense |

| DELETE | `/api/v1/expenses/{id}` | Delete expense |

| | | |

| GET | `/api/v1/income` | List income records (filter: `?farm\_id=`) |

| POST | `/api/v1/income` | Create income record |

| GET | `/api/v1/income/{id}` | Get one income record |

| PUT | `/api/v1/income/{id}` | Update income record |

| DELETE | `/api/v1/income/{id}` | Delete income record |

| | | |

| GET | `/api/v1/capital` | List capital records (filter: `?farm\_id=`) |

| POST | `/api/v1/capital` | Create capital record |

| GET | `/api/v1/capital/{id}` | Get one capital record |

| PUT | `/api/v1/capital/{id}` | Update capital record |

| DELETE | `/api/v1/capital/{id}` | Delete capital record |

| | | |

| GET | `/api/v1/audit-logs` | List audit logs (filter: `?entity\_name=`, `?action=`) |

| POST | `/api/v1/audit-logs` | Create audit log entry |

| | | |

| GET | `/api/v1/permissions` | List RBAC permissions |

| POST | `/api/v1/permissions` | Create permission |

| PUT | `/api/v1/permissions/{id}` | Update permission |

| DELETE | `/api/v1/permissions/{id}` | Delete permission |

| | | |

| GET | `/api/v1/permission-groups` | List permission groups |

| POST | `/api/v1/permission-groups` | Create permission group |

| PUT | `/api/v1/permission-groups/{id}` | Update permission group |

| DELETE | `/api/v1/permission-groups/{id}` | Delete permission group |

| | | |

| GET | `/api/v1/roles` | List roles |

| POST | `/api/v1/roles` | Create role |

| PUT | `/api/v1/roles/{id}` | Update role |

| DELETE | `/api/v1/roles/{id}` | Delete role |

| | | |

| GET | `/api/v1/user-roles` | List user role assignments |

| POST | `/api/v1/user-roles` | Create user role assignment |

| PUT | `/api/v1/user-roles/{id}` | Update user role assignment |

| DELETE | `/api/v1/user-roles/{id}` | Delete user role assignment |

| | | |

| GET | `/api/v1/users` | List all users (admin only) |

| POST | `/api/v1/users` | Create user account (admin only) |

| PUT | `/api/v1/users/{id}` | Update user (admin only, e.g. change role) |

| DELETE | `/api/v1/users/{id}` | Delete user (admin only) |

| | | |

| GET | `/api/v1/dashboard/summary` | Aggregated stats for dashboard (optional) |



\---



\### 5.3 Authentication Integration



\*\*Flow:\*\*



```

Frontend                              Backend

──────                                ───────

POST /api/auth/login                →  Validate credentials

&#x20; { email, password }               →  Issue JWT (access\_token + refresh\_token)

&#x20;                                   ←  { access\_token, refresh\_token, user }



Store access\_token in localStorage     (or httpOnly cookie — more secure)

&#x20; or memory



Every subsequent API request        →  Backend middleware validates JWT signature

&#x20; Authorization: Bearer <token>     →  Extracts user\_id, loads user from DB

&#x20;                                   →  Attaches user to request context

&#x20;                                   ←  Response or 401 Unauthorized



GET /api/auth/me                    →  Returns { id, email, full\_name, role }

Frontend stores this as currentUser    Used for sidebar guard + RBAC checks

```



\*\*Token storage recommendation:\*\*



| Method | Security | Simplicity |

|---|---|---|

| `localStorage` | Vulnerable to XSS | Simple |

| `httpOnly cookie` | XSS-safe, CSRF risk | Requires CORS + SameSite config |

| Memory (React state) | XSS-safe, lost on refresh | Requires refresh token flow |



For this system, `localStorage` with HTTPS is acceptable for internal tools. Use `httpOnly` cookies for production-facing apps.



\*\*JWT payload the backend should include:\*\*

```json

{

&#x20; "sub": "user-uuid",

&#x20; "email": "ahmed@company.com",

&#x20; "role": "admin",

&#x20; "iat": 1716400000,

&#x20; "exp": 1716486400

}

```



\---



\### 5.4 RBAC Integration



When connected to an external backend, RBAC enforcement moves to the server. The backend must:



1\. \*\*On every list/detail request\*\* — filter results based on the authenticated user's permission groups and scope (province\_id / farm\_id restrictions from PermissionGroup.scope\_ids)

2\. \*\*On every create/update/delete request\*\* — check if the user has the required permission key (e.g. `farms:write`) before executing the operation, return 403 if not

3\. \*\*Expose a permission-check endpoint\*\* (optional but recommended):



```

GET /api/v1/auth/my-permissions

Response:

{

&#x20; "permissions": \["farms:read", "employees:read", "finance:read"],

&#x20; "scopes": {

&#x20;   "province\_ids": \["province-uuid-1"],

&#x20;   "farm\_ids": \[]

&#x20; }

}

```



The frontend calls this once after login, caches the result in React state or React Query, and uses it for conditional rendering instead of calling `userHasPermission()` with multiple sequential fetches.



\---



\### 5.5 Laravel-Specific Guide



\#### Package Setup



```bash

composer require laravel/sanctum         # or tymon/jwt-auth for JWT

php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"

```



\#### Database Tables (Migrations)



Create one migration per entity. Map entity fields to columns:



```php

// Example: farms table

Schema::create('farms', function (Blueprint $table) {

&#x20;   $table->uuid('id')->primary()->default(DB::raw('(UUID())'));

&#x20;   $table->foreignUuid('province\_id')->constrained('provinces')->cascadeOnDelete();

&#x20;   $table->string('name');

&#x20;   $table->string('location')->nullable();

&#x20;   $table->unsignedInteger('capacity')->default(0);

&#x20;   $table->boolean('is\_active')->default(true);

&#x20;   $table->timestamps(); // created\_at, updated\_at

});

```



Repeat for: provinces, employees, chicken\_batches, chicken\_movements, feed\_inventory, feed\_transactions, expenses, income, capital, audit\_logs, permissions, permission\_groups, roles, user\_roles.



\#### Controllers



Use Resource Controllers:



```bash

php artisan make:controller Api/FarmController --resource --api --model=Farm

```



In `routes/api.php`:



```php

Route::middleware('auth:sanctum')->prefix('v1')->group(function () {

&#x20;   Route::apiResource('farms',             Api\\FarmController::class);

&#x20;   Route::apiResource('employees',         Api\\EmployeeController::class);

&#x20;   Route::apiResource('chicken-batches',   Api\\ChickenBatchController::class);

&#x20;   Route::apiResource('chicken-movements', Api\\ChickenMovementController::class);

&#x20;   Route::apiResource('feed-inventory',    Api\\FeedInventoryController::class);

&#x20;   Route::apiResource('feed-transactions', Api\\FeedTransactionController::class);

&#x20;   Route::apiResource('expenses',          Api\\ExpenseController::class);

&#x20;   Route::apiResource('income',            Api\\IncomeController::class);

&#x20;   Route::apiResource('capital',           Api\\CapitalController::class);

&#x20;   Route::apiResource('audit-logs',        Api\\AuditLogController::class);

&#x20;   Route::apiResource('permissions',       Api\\PermissionController::class);

&#x20;   Route::apiResource('permission-groups', Api\\PermissionGroupController::class);

&#x20;   Route::apiResource('roles',             Api\\RoleController::class);

&#x20;   Route::apiResource('user-roles',        Api\\UserRoleController::class);

&#x20;   Route::apiResource('users',             Api\\UserController::class);

});



Route::prefix('auth')->group(function () {

&#x20;   Route::post('login',           \[AuthController::class, 'login']);

&#x20;   Route::post('register',        \[AuthController::class, 'register']);

&#x20;   Route::post('logout',          \[AuthController::class, 'logout'])->middleware('auth:sanctum');

&#x20;   Route::get('me',               \[AuthController::class, 'me'])->middleware('auth:sanctum');

&#x20;   Route::post('forgot-password', \[AuthController::class, 'forgotPassword']);

&#x20;   Route::post('reset-password',  \[AuthController::class, 'resetPassword']);

});

```



\#### RBAC Middleware



```php

// app/Http/Middleware/CheckPermission.php

public function handle($request, Closure $next, $permissionKey) {

&#x20;   $user = $request->user();

&#x20;   $userRole = UserRole::where('user\_id', $user->id)->where('is\_active', true)->first();

&#x20;   if (!$userRole) return response()->json(\['success' => false, 'message' => 'Unauthorized'], 403);



&#x20;   $roles = Role::whereIn('id', $userRole->role\_ids)->where('is\_active', true)->get();

&#x20;   $groupIds = collect($roles)->pluck('permission\_group\_ids')->flatten()->unique();

&#x20;   $groups = PermissionGroup::whereIn('id', $groupIds)->where('is\_active', true)->get();

&#x20;   $permIds = collect($groups)->pluck('permission\_ids')->flatten()->unique();

&#x20;   $hasPermission = Permission::whereIn('id', $permIds)->where('name', $permissionKey)->exists();



&#x20;   if (!$hasPermission) return response()->json(\['success' => false, 'message' => 'Forbidden'], 403);

&#x20;   return $next($request);

}

```



Register and use:

```php

// In FarmController:

public function \_\_construct() {

&#x20;   $this->middleware('permission:farms:read')->only(\['index', 'show']);

&#x20;   $this->middleware('permission:farms:write')->only(\['store', 'update']);

&#x20;   $this->middleware('permission:farms:delete')->only(\['destroy']);

}

```



\#### FeedTransaction Auto-Update Inventory



```php

// In FeedTransactionController::store()

public function store(Request $request) {

&#x20;   $transaction = FeedTransaction::create($request->validated());



&#x20;   // Auto-update FeedInventory

&#x20;   $inventory = FeedInventory::firstOrCreate(\['farm\_id' => $transaction->farm\_id]);

&#x20;   if ($transaction->type === 'IN') {

&#x20;       $inventory->increment('quantity', $transaction->quantity);

&#x20;   } else {

&#x20;       $inventory->decrement('quantity', $transaction->quantity);

&#x20;   }



&#x20;   return response()->json(\['success' => true, 'data' => $transaction]);

}

```



\#### CORS Configuration



```php

// config/cors.php

'paths'             => \['api/\*'],

'allowed\_origins'   => \['https://your-react-app.com'],

'allowed\_methods'   => \['\*'],

'allowed\_headers'   => \['\*'],

'exposed\_headers'   => \[],

'max\_age'           => 0,

'supports\_credentials' => true,   // if using cookies

```



\---



\### 5.6 Django-Specific Guide



\#### Package Setup



```bash

pip install djangorestframework djangorestframework-simplejwt django-cors-headers

```



`settings.py`:

```python

INSTALLED\_APPS = \[

&#x20;   ...

&#x20;   'rest\_framework',

&#x20;   'corsheaders',

&#x20;   'your\_app',

]



MIDDLEWARE = \[

&#x20;   'corsheaders.middleware.CorsMiddleware',  # must be first

&#x20;   ...

]



REST\_FRAMEWORK = {

&#x20;   'DEFAULT\_AUTHENTICATION\_CLASSES': \[

&#x20;       'rest\_framework\_simplejwt.authentication.JWTAuthentication',

&#x20;   ],

&#x20;   'DEFAULT\_PERMISSION\_CLASSES': \[

&#x20;       'rest\_framework.permissions.IsAuthenticated',

&#x20;   ],

&#x20;   'DEFAULT\_PAGINATION\_CLASS': 'rest\_framework.pagination.PageNumberPagination',

&#x20;   'PAGE\_SIZE': 100,

}



CORS\_ALLOWED\_ORIGINS = \[

&#x20;   "https://your-react-app.com",

]



SIMPLE\_JWT = {

&#x20;   'ACCESS\_TOKEN\_LIFETIME': timedelta(days=1),

&#x20;   'REFRESH\_TOKEN\_LIFETIME': timedelta(days=7),

}

```



\#### Models



```python

\# models.py

import uuid

from django.db import models



class Province(models.Model):

&#x20;   id = models.UUIDField(primary\_key=True, default=uuid.uuid4, editable=False)

&#x20;   name = models.CharField(max\_length=255, unique=True)

&#x20;   is\_active = models.BooleanField(default=True)

&#x20;   created\_at = models.DateTimeField(auto\_now\_add=True)

&#x20;   updated\_at = models.DateTimeField(auto\_now=True)



class Farm(models.Model):

&#x20;   id = models.UUIDField(primary\_key=True, default=uuid.uuid4, editable=False)

&#x20;   province = models.ForeignKey(Province, on\_delete=models.PROTECT, related\_name='farms')

&#x20;   name = models.CharField(max\_length=255)

&#x20;   location = models.TextField(blank=True)

&#x20;   capacity = models.PositiveIntegerField(default=0)

&#x20;   is\_active = models.BooleanField(default=True)

&#x20;   created\_at = models.DateTimeField(auto\_now\_add=True)

&#x20;   updated\_at = models.DateTimeField(auto\_now=True)



\# ... repeat for Employee, ChickenBatch, ChickenMovement,

\# FeedInventory, FeedTransaction, Expense, Income, Capital,

\# AuditLog, Permission, PermissionGroup, Role, UserRole

```



\#### ViewSets (ModelViewSet)



```python

\# views.py

from rest\_framework import viewsets

from rest\_framework.permissions import IsAuthenticated



class FarmViewSet(viewsets.ModelViewSet):

&#x20;   serializer\_class = FarmSerializer

&#x20;   permission\_classes = \[IsAuthenticated, HasPermission('farms:read')]



&#x20;   def get\_queryset(self):

&#x20;       qs = Farm.objects.all()

&#x20;       if farm\_id := self.request.query\_params.get('farm\_id'):

&#x20;           qs = qs.filter(id=farm\_id)

&#x20;       if is\_active := self.request.query\_params.get('is\_active'):

&#x20;           qs = qs.filter(is\_active=is\_active == 'true')

&#x20;       return qs

```



\#### URLs



```python

\# urls.py

from rest\_framework.routers import DefaultRouter



router = DefaultRouter()

router.register(r'provinces',       ProvinceViewSet)

router.register(r'farms',           FarmViewSet)

router.register(r'employees',       EmployeeViewSet)

router.register(r'chicken-batches', ChickenBatchViewSet)

router.register(r'chicken-movements', ChickenMovementViewSet)

router.register(r'feed-inventory',  FeedInventoryViewSet)

router.register(r'feed-transactions', FeedTransactionViewSet)

router.register(r'expenses',        ExpenseViewSet)

router.register(r'income',          IncomeViewSet)

router.register(r'capital',         CapitalViewSet)

router.register(r'audit-logs',      AuditLogViewSet)

router.register(r'permissions',     PermissionViewSet)

router.register(r'permission-groups', PermissionGroupViewSet)

router.register(r'roles',           RoleViewSet)

router.register(r'user-roles',      UserRoleViewSet)

router.register(r'users',           UserViewSet)



urlpatterns = \[

&#x20;   path('api/v1/', include(router.urls)),

&#x20;   path('api/auth/login',          TokenObtainPairView.as\_view()),

&#x20;   path('api/auth/refresh',        TokenRefreshView.as\_view()),

&#x20;   path('api/auth/me',             CurrentUserView.as\_view()),

&#x20;   path('api/auth/register',       RegisterView.as\_view()),

&#x20;   path('api/auth/forgot-password', ForgotPasswordView.as\_view()),

&#x20;   path('api/auth/reset-password', ResetPasswordView.as\_view()),

]

```



\#### RBAC Permission Class



```python

\# permissions.py

from rest\_framework.permissions import BasePermission



class HasPermission(BasePermission):

&#x20;   def \_\_init\_\_(self, permission\_key):

&#x20;       self.permission\_key = permission\_key



&#x20;   def has\_permission(self, request, view):

&#x20;       user = request.user

&#x20;       user\_role = UserRole.objects.filter(user\_id=user.id, is\_active=True).first()

&#x20;       if not user\_role:

&#x20;           return False



&#x20;       roles = Role.objects.filter(id\_\_in=user\_role.role\_ids, is\_active=True)

&#x20;       group\_ids = set()

&#x20;       for role in roles:

&#x20;           group\_ids.update(role.permission\_group\_ids)



&#x20;       groups = PermissionGroup.objects.filter(id\_\_in=group\_ids, is\_active=True)

&#x20;       perm\_ids = set()

&#x20;       for group in groups:

&#x20;           perm\_ids.update(group.permission\_ids)



&#x20;       return Permission.objects.filter(id\_\_in=perm\_ids, name=self.permission\_key).exists()

```



\#### FeedTransaction Signal (Auto-Update Inventory)



```python

\# signals.py

from django.db.models.signals import post\_save

from django.dispatch import receiver



@receiver(post\_save, sender=FeedTransaction)

def update\_feed\_inventory(sender, instance, created, \*\*kwargs):

&#x20;   if created:

&#x20;       inventory, \_ = FeedInventory.objects.get\_or\_create(farm=instance.farm)

&#x20;       if instance.type == 'IN':

&#x20;           inventory.quantity += instance.quantity

&#x20;       else:

&#x20;           inventory.quantity = max(0, inventory.quantity - instance.quantity)

&#x20;       inventory.save()

```



\---



\### 5.7 Frontend Changes Required to Switch to External Backend



Currently the frontend uses `base44.entities.EntityName.list()` SDK calls. To switch to a custom backend, replace each SDK call with a standard `fetch` or `axios` call.



\#### Step 1 — Create a centralized API client



```js

// src/api/apiClient.js



const BASE\_URL = import.meta.env.VITE\_API\_BASE\_URL; // e.g. https://your-backend.com



const getToken = () => localStorage.getItem("access\_token");



export const api = {

&#x20; get: (path, params = {}) => {

&#x20;   const url = new URL(`${BASE\_URL}${path}`);

&#x20;   Object.entries(params).forEach((\[k, v]) => url.searchParams.set(k, v));

&#x20;   return fetch(url, {

&#x20;     headers: { Authorization: `Bearer ${getToken()}` }

&#x20;   }).then(r => r.json());

&#x20; },



&#x20; post: (path, body) =>

&#x20;   fetch(`${BASE\_URL}${path}`, {

&#x20;     method: "POST",

&#x20;     headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },

&#x20;     body: JSON.stringify(body),

&#x20;   }).then(r => r.json()),



&#x20; put: (path, body) =>

&#x20;   fetch(`${BASE\_URL}${path}`, {

&#x20;     method: "PUT",

&#x20;     headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },

&#x20;     body: JSON.stringify(body),

&#x20;   }).then(r => r.json()),



&#x20; delete: (path) =>

&#x20;   fetch(`${BASE\_URL}${path}`, {

&#x20;     method: "DELETE",

&#x20;     headers: { Authorization: `Bearer ${getToken()}` }

&#x20;   }).then(r => r.json()),

};

```



\#### Step 2 — Replace SDK calls in each page/component



| Current (Base44 SDK) | Replacement (Custom Backend) |

|---|---|

| `base44.entities.Farm.list()` | `api.get('/api/v1/farms').then(r => r.data.results)` |

| `base44.entities.Farm.filter({province\_id: id})` | `api.get('/api/v1/farms', { province\_id: id }).then(r => r.data.results)` |

| `base44.entities.Farm.create(data)` | `api.post('/api/v1/farms', data).then(r => r.data)` |

| `base44.entities.Farm.update(id, data)` | `api.put('/api/v1/farms/${id}', data).then(r => r.data)` |

| `base44.entities.Farm.delete(id)` | `api.delete('/api/v1/farms/${id}')` |

| `base44.auth.me()` | `api.get('/api/auth/me').then(r => r.data)` |

| `base44.auth.loginViaEmailPassword(e, p)` | `api.post('/api/auth/login', {email: e, password: p}).then(r => { localStorage.setItem('access\_token', r.data.access\_token); })` |

| `base44.auth.logout()` | `api.post('/api/auth/logout').then(() => { localStorage.removeItem('access\_token'); window.location.href = '/login'; })` |



\#### Step 3 — Replace the AuthContext



Rewrite `src/lib/AuthContext.jsx` to:

1\. On mount, call `GET /api/auth/me` using stored token

2\. If 401 response → set `currentUser = null`, `isAuthenticated = false`

3\. If 200 response → set `currentUser = response.data`, `isAuthenticated = true`



\#### Step 4 — Environment variable



Create `.env` file:

```

VITE\_API\_BASE\_URL=https://your-laravel-or-django-backend.com

```



No other configuration needed. All routing, rendering, and state management stays exactly the same.



\---



\### 5.8 Connection Map — What Connects to What



```

┌─────────────────────────────────────────────────────────────┐

│                    REACT FRONTEND                           │

│                                                             │

│  Login Page         → POST /api/auth/login                  │

│  AuthContext        → GET  /api/auth/me  (on app load)      │

│  ProtectedRoute     → reads currentUser from AuthContext     │

│  Sidebar            → reads currentUser.role for admin links │

│                                                             │

│  Dashboard          → GET /api/v1/farms                     │

│                       GET /api/v1/employees                  │

│                       GET /api/v1/chicken-batches            │

│                       GET /api/v1/expenses                   │

│                       GET /api/v1/income                     │

│                                                             │

│  Farms Page         → GET/POST/PUT/DELETE /api/v1/farms      │

│                       GET /api/v1/provinces (for dropdown)   │

│                                                             │

│  Employees Page     → GET/POST/PUT/DELETE /api/v1/employees  │

│                       GET /api/v1/farms (for dropdown)       │

│                                                             │

│  Chickens Page      → GET/POST/PUT/DELETE /api/v1/chicken-batches    │

│                       GET/POST/PUT/DELETE /api/v1/chicken-movements  │

│                       GET /api/v1/farms (for dropdown)               │

│                                                             │

│  Feed Page          → GET/POST/PUT/DELETE /api/v1/feed-inventory     │

│                       GET/POST/PUT/DELETE /api/v1/feed-transactions  │

│                       GET /api/v1/farms (for dropdown)               │

│                                                             │

│  Finance Page       → GET/POST/PUT/DELETE /api/v1/expenses  │

│                       GET/POST/PUT/DELETE /api/v1/income     │

│                       GET/POST/PUT/DELETE /api/v1/capital    │

│                       GET /api/v1/farms (for dropdown)       │

│                                                             │

│  Reports Page       → GET all of above (read-only)          │

│                                                             │

│  Audit Log Page     → GET /api/v1/audit-logs                │

│                                                             │

│  Access Control     → GET/POST/PUT/DELETE /api/v1/permissions          │

│                       GET/POST/PUT/DELETE /api/v1/permission-groups    │

│                       GET/POST/PUT/DELETE /api/v1/roles                │

│                       GET/POST/PUT/DELETE /api/v1/user-roles           │

│                       GET /api/v1/farms (for scope selector) │

│                       GET /api/v1/provinces (for scope selector)       │

│                       GET /api/v1/users (for user dropdown)  │

│                                                             │

│  User Management    → GET/POST/PUT/DELETE /api/v1/users     │

│                                                             │

└─────────────────────────────────────────────────────────────┘

&#x20;                             │

&#x20;                             │ HTTPS JSON API

&#x20;                             │ Authorization: Bearer <JWT>

&#x20;                             ▼

┌─────────────────────────────────────────────────────────────┐

│              LARAVEL OR DJANGO BACKEND                      │

│                                                             │

│  Auth Controller    → issues JWT, validates, refreshes      │

│  Farm Controller    → CRUD + RBAC middleware check           │

│  Employee Controller → CRUD + farm scope filter             │

│  Chicken Controllers → CRUD + farm scope filter             │

│  Feed Controllers   → CRUD + auto-update FeedInventory      │

│  Finance Controllers → CRUD + aggregation for reports       │

│  AuditLog Controller → append-only log writer               │

│  RBAC Controllers   → manage permissions/groups/roles/assignments │

│  User Controller    → admin-only user management            │

│                                                             │

│  RBAC Middleware    → intercepts every request              │

│                       → checks UserRole → Role → Group → Permission │

│                       → filters queryset by scope\_ids       │

│                       → returns 403 if insufficient access  │

│                                                             │

│  Database (PostgreSQL)                                      │

│  ├── provinces, farms                                       │

│  ├── employees                                              │

│  ├── chicken\_batches, chicken\_movements                     │

│  ├── feed\_inventory, feed\_transactions                      │

│  ├── expenses, income, capital                              │

│  ├── audit\_logs                                             │

│  ├── permissions, permission\_groups, roles, user\_roles      │

│  └── users                                                  │

└─────────────────────────────────────────────────────────────┘

```



\---



\*Poultry ERP — System Functionality Reference | May 2026\*

\*Frontend: React 18 + Base44 | Backend-ready for Laravel or Django\*

