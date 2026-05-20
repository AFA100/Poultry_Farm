# RBAC & User Management — Full Implementation Specification

> **Purpose:** This document is a word-for-word, copy-paste-ready specification for implementing the complete Role-Based Access Control (RBAC) system and User Management module into any React + REST/BaaS project. Hand this file to GitHub Copilot and it will know exactly what to build.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Data Entities (Database Schema)](#2-data-entities-database-schema)
3. [User Management Module](#3-user-management-module)
4. [Access Control Module](#4-access-control-module)
   - 4.1 [Permissions Tab](#41-permissions-tab)
   - 4.2 [Permission Groups Tab](#42-permission-groups-tab)
   - 4.3 [Roles Tab](#43-roles-tab)
   - 4.4 [User Assignments Tab](#44-user-assignments-tab)
5. [Shared / Reusable Components](#5-shared--reusable-components)
6. [Routing & Sidebar](#6-routing--sidebar)
7. [Step-by-Step Build Order](#7-step-by-step-build-order)
8. [Runtime Permission Check](#8-runtime-permission-check-how-to-use-rbac-in-your-app)
9. [Authentication & Authorization — Rules & Enforcement](#9-authentication--authorization--rules--enforcement)
10. [Full System Flow — Plain Narration](#10-full-system-flow--plain-narration-with-auth-highlighted)

---

## 1. Architecture Overview

The system has **two separate admin modules**:

| Module | Path | Purpose |
|---|---|---|
| User Management | `/user-management` | Super admin creates users, changes their base role (admin/user), deletes accounts |
| Access Control | `/access-control` | Super admin manages fine-grained RBAC: permissions → groups → roles → user assignments |

### How RBAC works (the chain)

```
Permission  →  PermissionGroup  →  Role  →  UserRole (assigned to a real user)
```

- A **Permission** is a single atomic action, e.g. `farms:read`, `finance:write`.
- A **PermissionGroup** is a named collection of permissions, optionally scoped to a Province or Farm.
- A **Role** is a named collection of PermissionGroups (e.g. "Farm Manager" = [Farm Viewers Group + Feed Readers Group]).
- A **UserRole** record links a real user account to one or more Roles.

To check if a user can do something at runtime, look up their UserRole record → expand role_ids → expand permission_group_ids → expand permission_ids → check if the needed permission key exists.

---

## 2. Data Entities (Database Schema)

Create these five entities/tables. Every record automatically gets `id`, `created_date`, `updated_date`, `created_by`.

---

### 2.1 Permission

```json
{
  "name": "Permission",
  "type": "object",
  "properties": {
    "name":        { "type": "string",  "description": "Unique key e.g. farms:read, finance:write" },
    "label":       { "type": "string",  "description": "Human-readable label shown in UI" },
    "module":      { "type": "string",  "enum": ["farms","employees","chickens","feed","finance","reports","audit_log","rbac"] },
    "action":      { "type": "string",  "enum": ["read","write","delete","manage"] },
    "description": { "type": "string" }
  },
  "required": ["name", "module", "action"]
}
```

**Key rule:** `name` must be unique. Convention is `module:action` e.g. `farms:read`.

---

### 2.2 PermissionGroup

```json
{
  "name": "PermissionGroup",
  "type": "object",
  "properties": {
    "name":           { "type": "string",  "description": "e.g. Finance Team, Province A Viewers" },
    "description":    { "type": "string" },
    "permission_ids": { "type": "array",   "items": { "type": "string" }, "description": "Array of Permission IDs" },
    "scope_type":     { "type": "string",  "enum": ["global","province","farm"], "default": "global" },
    "scope_ids":      { "type": "array",   "items": { "type": "string" }, "description": "Province or Farm IDs this group is limited to. Empty array = all." },
    "is_active":      { "type": "boolean", "default": true }
  },
  "required": ["name"]
}
```

**Key rule:** `scope_type: "global"` means no data restriction. `scope_type: "province"` means `scope_ids` holds Province IDs. `scope_type: "farm"` means `scope_ids` holds Farm IDs.

---

### 2.3 Role

```json
{
  "name": "Role",
  "type": "object",
  "properties": {
    "name":                  { "type": "string", "description": "e.g. Farm Manager, Finance Viewer" },
    "description":           { "type": "string" },
    "permission_group_ids":  { "type": "array",   "items": { "type": "string" }, "description": "Array of PermissionGroup IDs" },
    "is_active":             { "type": "boolean", "default": true }
  },
  "required": ["name"]
}
```

---

### 2.4 UserRole

```json
{
  "name": "UserRole",
  "type": "object",
  "properties": {
    "user_id":    { "type": "string",  "description": "Reference to User account ID" },
    "user_email": { "type": "string",  "description": "User email stored for fast display (denormalized)" },
    "role_ids":   { "type": "array",   "items": { "type": "string" }, "description": "Array of Role IDs assigned to this user" },
    "notes":      { "type": "string" },
    "is_active":  { "type": "boolean", "default": true }
  },
  "required": ["user_id", "user_email"]
}
```

**Key rule:** One UserRole record per user. The record holds ALL roles for that user as an array in `role_ids`.

---

### 2.5 User (built-in / existing)

The User entity already exists. It has at minimum:

| Field | Type | Notes |
|---|---|---|
| id | string (UUID) | Auto-generated |
| email | string | Unique |
| full_name | string | Optional |
| role | string | `"admin"` or `"user"` — this is the BASE platform role, not RBAC |
| created_date | string (ISO date) | Auto-generated |

> **Important distinction:** The `role` field on the User entity (`admin`/`user`) controls whether someone is a super admin. The `UserRole` entity controls fine-grained RBAC permissions. These are two separate systems.

---

## 3. User Management Module

### 3.1 What it does

- Super admin creates new user accounts directly (no invite email flow — accounts are created immediately).
- Super admin can change a user's base role between `user` and `admin`.
- Super admin can delete a user account with a confirmation dialog.
- Shows a stats bar: total users, admin count, regular user count.
- Has search by name/email and filter by role.

---

### 3.2 File: `pages/UserManagement.jsx`

**Component structure:**
```
UserManagement (page)
├── Stats Row (3 cards: Total, Admins, Users)
├── Filter Bar (search input + role select)
├── User List (Card with rows)
│   └── UserRow (per user)
│       ├── Avatar (initials)
│       ├── Name + Email
│       ├── Joined date
│       ├── Role Select (inline dropdown, saves immediately on change)
│       └── Delete button (with AlertDialog confirmation)
└── CreateUserDialog (modal)
```

**State variables:**
```js
const [createOpen, setCreateOpen] = useState(false);   // controls Create User dialog
const [search, setSearch]         = useState("");       // search text
const [roleFilter, setRoleFilter] = useState("all");   // "all" | "admin" | "user"
```

**Data fetching:**
```js
// Fetch all users
const { data: users = [], isLoading } = useQuery({
  queryKey: ["system-users"],
  queryFn: () => YourApiClient.entities.User.list(),
});
```

**Mutations:**
```js
// Update role inline
const updateRoleMutation = useMutation({
  mutationFn: ({ id, role }) => YourApiClient.entities.User.update(id, { role }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["system-users"] }),
});

// Delete user
const deleteMutation = useMutation({
  mutationFn: (id) => YourApiClient.entities.User.delete(id),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["system-users"] }),
});
```

**Filter logic:**
```js
const filtered = users.filter(u => {
  const matchSearch = !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase());
  const matchRole = roleFilter === "all" || u.role === roleFilter;
  return matchSearch && matchRole;
});
```

---

### 3.3 Component: `UserRow`

Props: `{ user, onRoleChange, onDelete }`

```jsx
// Avatar initials: take first letter of each word in full_name or email
const initials = (user.full_name || user.email || "?")
  .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
```

**Role badge colors:**
```js
const roleBadgeClass = {
  admin: "bg-amber-100 text-amber-800 border-amber-200",
  user:  "bg-blue-100 text-blue-700 border-blue-200",
};
```

**Role Select** renders inline. On `onValueChange` it immediately calls `onRoleChange(user.id, newRole)`.

**Delete button** is hidden by default (`opacity-0`) and appears on row hover (`group-hover:opacity-100`). It opens an `AlertDialog` asking "Remove User — This will permanently remove user@email from the system. This cannot be undone." with Cancel and Remove (destructive) buttons.

---

### 3.4 Component: `CreateUserDialog`

> ⚠️ **Critical requirement:** Do NOT use an invite flow. The super admin creates the user account directly. The user does not receive an email. The account is created immediately in the database.

Props: `{ open, onOpenChange }`

**Form fields:**
| Field | Type | Required | Notes |
|---|---|---|---|
| Full Name | text input | No | `full_name` field |
| Email | email input | Yes | Must contain `@` |
| Password | password input | Yes | Min 8 chars |
| Role | select | Yes | Options: `user`, `admin` |

**Validation (before submit):**
```js
if (!form.email.trim() || !form.email.includes("@")) errors.email = "Enter a valid email";
if (!form.password || form.password.length < 8)       errors.password = "Minimum 8 characters";
```

**Submit:**
```js
// Call your backend's user creation API, not an invite API.
await YourApiClient.entities.User.create({
  email: form.email.trim(),
  full_name: form.full_name.trim(),
  role: form.role,
  // password handling depends on your backend — pass it here
});
```

After success: show a toast "User created", close the dialog, invalidate the `system-users` query.

**Dialog title:** "Create New User"
**Submit button label:** "Create User"
**Cancel button label:** "Cancel"

---

### 3.5 Stats Cards (in UserManagement page)

```jsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
  <Card className="p-4">
    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Users</p>
    <p className="text-2xl font-bold mt-1">{users.length}</p>
  </Card>
  <Card className="p-4">
    <p className="text-xs text-muted-foreground uppercase tracking-wider">Admins</p>
    <p className="text-2xl font-bold mt-1 text-amber-600">{adminCount}</p>
  </Card>
  <Card className="p-4 col-span-2 sm:col-span-1">
    <p className="text-xs text-muted-foreground uppercase tracking-wider">Regular Users</p>
    <p className="text-2xl font-bold mt-1 text-blue-600">{userCount}</p>
  </Card>
</div>
```

---

## 4. Access Control Module

### 4.1 Overview

File: `pages/AccessControl.jsx`

This page is a single `<Tabs>` component with 4 tabs:

```
Tab 1: Permissions      → PermissionsTab component
Tab 2: Permission Groups → PermissionGroupsTab component
Tab 3: Roles            → RolesTab component
Tab 4: User Assignments → UserRolesTab component
```

```jsx
export default function AccessControl() {
  const [tab, setTab] = useState("permissions");
  return (
    <div>
      <PageHeader title="Access Control" description="Manage permissions, groups, roles and user assignments" />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="groups">Permission Groups</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="users">User Assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="permissions"><PermissionsTab /></TabsContent>
        <TabsContent value="groups"><PermissionGroupsTab /></TabsContent>
        <TabsContent value="roles"><RolesTab /></TabsContent>
        <TabsContent value="users"><UserRolesTab /></TabsContent>
      </Tabs>
    </div>
  );
}
```

---

### 4.1 Permissions Tab

**File:** `components/rbac/PermissionsTab.jsx`

**What it shows:** A data table of all Permission records.

**Table columns:**
| Column | Key | Render |
|---|---|---|
| Key | `name` | `<code>` styled tag with monospace font, muted background |
| Label | `label` | Bold text, `—` if empty |
| Module | `module` | Colored badge (see colors below) |
| Action | `action` | Colored badge (see colors below) |
| Description | `description` | Muted small text, `—` if empty |

**Module badge colors:**
```js
const MODULE_COLORS = {
  farms:     "bg-amber-500/10 text-amber-700",
  employees: "bg-orange-500/10 text-orange-700",
  chickens:  "bg-yellow-500/10 text-yellow-700",
  feed:      "bg-lime-500/10 text-lime-700",
  finance:   "bg-emerald-500/10 text-emerald-700",
  reports:   "bg-sky-500/10 text-sky-700",
  audit_log: "bg-violet-500/10 text-violet-700",
  rbac:      "bg-rose-500/10 text-rose-700",
};
```

**Action badge colors:**
```js
const ACTION_COLORS = {
  read:   "bg-stone-200/80 text-stone-600",
  write:  "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  manage: "bg-purple-100 text-purple-700",
};
```

**Toolbar:** One button top-right: `"Add Permission"` → opens `PermissionFormDialog`.

**Mutations:** create, update (on row click → edit), delete (inline delete button in row).

---

#### PermissionFormDialog

**File:** `components/rbac/PermissionFormDialog.jsx`

**Form fields:**
| Field | Input type | Required | Placeholder |
|---|---|---|---|
| Permission Key | text | Yes | `"module:action"` e.g. `farms:read` |
| Label | text | No | `"Human-readable name"` |
| Module | select | Yes | Options: farms, employees, chickens, feed, finance, reports, audit_log, rbac |
| Action | select | Yes | Options: read, write, delete, manage |
| Description | text | No | `"Optional description"` |

**Validation:** `name` (key) must not be empty. `module` must be selected. `action` must be selected.

**Dialog title:** `"Add Permission"` or `"Edit Permission"` depending on edit mode.
**Submit label:** `"Create Permission"` or `"Update Permission"`.

---

### 4.2 Permission Groups Tab

**File:** `components/rbac/PermissionGroupsTab.jsx`

**What it shows:** A data table of all PermissionGroup records.

**Table columns:**
| Column | Key | Render |
|---|---|---|
| Group Name | `name` | Bold text |
| Description | `description` | Muted small text, `—` if empty |
| Scope | `scope_type` | Colored badge |
| Permissions | `permission_ids` | Up to 3 badges showing permission labels; `+N` more badge if overflow; "None" if empty |

**Scope badge colors:**
```js
const SCOPE_COLORS = {
  global:   "bg-blue-100 text-blue-700",
  province: "bg-amber-100 text-amber-700",
  farm:     "bg-green-100 text-green-700",
};
```

**Data fetching needed:** permissions list, farms list, provinces list (all needed for the dialog form).

**Toolbar:** One button top-right: `"Add Group"` → opens `PermissionGroupFormDialog`.

---

#### PermissionGroupFormDialog

**File:** `components/rbac/PermissionGroupFormDialog.jsx`

**Form fields:**

Row 1 (2-column grid):
| Field | Input | Required | Notes |
|---|---|---|---|
| Group Name | text | Yes | e.g. "Finance Team" |
| Data Scope | select | No | Options: "Global (All Data)", "Province-scoped", "Farm-scoped" |

Row 2:
| Field | Input | Required |
|---|---|---|
| Description | text | No |

**Conditional scope selector:** When `scope_type` is `"province"` show a checklist of all provinces. When `scope_type` is `"farm"` show a checklist of all farms. When `scope_type` is `"global"` hide this section.

- Each item in the checklist is a `<Checkbox>` + farm/province name.
- Checking toggles the ID in/out of `scope_ids` array.
- Hint text: `"Check all that apply. Empty = all."`

**Permissions section:** Show all permissions grouped by module. For each module that has at least 1 permission, render:
- A section header with the module name in small uppercase text.
- A 2×4 grid of checkboxes, each showing the permission `label` (or `name` if no label).
- Checking a checkbox toggles the permission ID in/out of `permission_ids`.

**Selected permissions summary:** If `permission_ids.length > 0`, show a muted box below listing all selected permissions as small outline badges.

**State management:**
```js
// On scope_type change, also clear scope_ids
const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
// On scope_type change:
set("scope_type", v);
set("scope_ids", []);

// Toggle a permission
const togglePermission = (id) => {
  const ids = form.permission_ids || [];
  set("permission_ids", ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
};

// Toggle a scope item
const toggleScope = (id) => {
  const ids = form.scope_ids || [];
  set("scope_ids", ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
};
```

**Submit default:** If `scope_type` is not set, default it to `"global"` before saving.

---

### 4.3 Roles Tab

**File:** `components/rbac/RolesTab.jsx`

**What it shows:** A data table of all Role records.

**Table columns:**
| Column | Key | Render |
|---|---|---|
| Role Name | `name` | Bold text |
| Description | `description` | Muted small text |
| Permission Groups | `permission_group_ids` | Badges showing group names. "None assigned" if empty |
| Status | `is_active` | Green badge "Active" or grey badge "Inactive" |

**Permission Group badge color:** `"bg-amber-500/10 text-amber-700"`

**Status badge colors:**
```js
// Active:
"bg-green-100 text-green-700"
// Inactive (is_active === false):
"bg-stone-200 text-stone-500"
```

**Data fetching needed:** permission-groups list (to resolve group names in the table).

**Toolbar:** One button top-right: `"Add Role"` → opens `RoleFormDialog`.

---

#### RoleFormDialog

**File:** `components/rbac/RoleFormDialog.jsx`

**Form fields:**
| Field | Input | Required |
|---|---|---|
| Role Name | text | Yes |
| Description | text | No |
| Permission Groups | scrollable checklist | No |

**Permission Groups checklist:**
- Each item is a `<Checkbox>` + group name (bold) + group description (muted small text below) + two mini badges: scope type (blue) and permissions count (outline).
- Max height: `max-h-56 overflow-y-auto`.
- Checking toggles the group ID in/out of `permission_group_ids`.
- Empty state text: `"No groups yet. Create them in the Permission Groups tab."`

**Selected groups summary:** If `permission_group_ids.length > 0`, show an amber-tinted box listing selected group names as amber badges.

```jsx
// Summary box styling:
className="bg-amber-50 border border-amber-200 rounded-md p-3"
// Title:
<p className="text-xs font-medium text-amber-800 mb-1">Assigned groups ({count})</p>
```

---

### 4.4 User Assignments Tab

**File:** `components/rbac/UserRolesTab.jsx`

**What it shows:** A data table of all UserRole records. Each record = one user's RBAC role assignment.

**Table columns:**
| Column | Key | Render |
|---|---|---|
| User Email | `user_email` | Bold medium text |
| Roles | `role_ids` | Purple badges showing role names |
| Effective Groups | `role_ids` (computed) | Outline badges showing all permission groups inherited from all assigned roles (max 3 shown, `+N` overflow) |
| Status | `is_active` | Green/grey badge |

**Effective groups computation:**
```js
// Build lookup maps from fetched data
const roleMap  = roles.reduce((a, r) => ({ ...a, [r.id]: r }), {});
const groupMap = groups.reduce((a, g) => ({ ...a, [g.id]: g }), {});

const getEffectiveGroups = (roleIds = []) => {
  const gIds = new Set();
  roleIds.forEach(rid => {
    const role = roleMap[rid];
    (role?.permission_group_ids || []).forEach(gid => gIds.add(gid));
  });
  return [...gIds].map(gid => groupMap[gid]).filter(Boolean);
};
```

**Role badge color:** `"bg-purple-100 text-purple-700"`

**Data fetching needed:** user-roles list, roles list, permission-groups list, system-users list (all needed).

**Toolbar:** Button: `"Assign User"` → opens `UserRoleFormDialog` in create mode.

**Row click** → opens `UserRoleFormDialog` in edit mode.

**Subheading text:** `"Assign roles to users. Each role carries its permission groups."`

---

#### UserRoleFormDialog

**File:** `components/rbac/UserRoleFormDialog.jsx`

**Props:** `{ open, onOpenChange, userRole, roles, systemUsers, onSubmit }`

**Form fields:**
| Field | Input | Required | Notes |
|---|---|---|---|
| User | dropdown select | Yes | Create mode: dropdown of all system users. Edit mode: disabled text input showing the email. |
| Roles | scrollable checklist | No | Select zero or more roles |
| Notes | text input | No | Optional memo |

**User dropdown (create mode only):**
- Options populated from `systemUsers` array.
- Each option shows `full_name` as main text and `email` as sub-text (if full_name exists).
- On select, store both `user_id` and `user_email` in the form state:
```js
const handleUserSelect = (userId) => {
  const user = systemUsers.find(u => u.id === userId);
  if (user) setForm(f => ({ ...f, user_id: user.id, user_email: user.email }));
};
```
- Empty state: `"No users found"` (disabled option).

**User field (edit mode):** Render `<Input value={form.user_email} disabled />` — user cannot change which account the assignment is for.

**Roles checklist:**
- Each item: `<Checkbox>` + role name (bold) + role description (muted) + amber mini badge showing `"N group(s)"`.
- Empty state: `"No roles yet. Create them in the Roles tab first."`

**Selected roles summary:** If any roles selected, show a purple-tinted box:
```jsx
className="bg-purple-50 border border-purple-200 rounded-md p-3"
// Title:
<p className="text-xs font-medium text-purple-800 mb-1">Assigned roles ({count})</p>
```

**Validation:**
```js
if (!form.user_id) errors.user_email = "Please select a user";
```

**Dialog titles:**
- Create mode: `"Assign Roles to User"`
- Edit mode: `"Edit User Assignment"`

**Submit labels:**
- Create: `"Assign Roles"`
- Edit: `"Update Roles"`

**Empty state for form:** `const empty = { user_id: "", user_email: "", role_ids: [], notes: "", is_active: true };`

---

## 5. Shared / Reusable Components

These two components are used everywhere and must exist before building any feature.

### 5.1 DataTable

**File:** `components/shared/DataTable.jsx`

**Props:**
```ts
{
  columns:      Array<{ key: string, label: string, render?: (value, row) => ReactNode }>,
  data:         Array<object>,
  isLoading:    boolean,
  onRowClick?:  (row) => void,   // if provided, pencil icon appears per row
  onDelete?:    (row) => void,   // if provided, trash icon appears per row with confirmation dialog
  emptyMessage: string,
}
```

**Behaviour:**
- `isLoading` → show skeleton rows (5 rows, each cell is `<Skeleton className="h-4 w-24" />`).
- Empty data → show centered message with emoji `📭` and the `emptyMessage` text.
- Each row has `group` class so action buttons can use `opacity-0 group-hover:opacity-100`.
- Edit button: pencil icon (`Pencil` from lucide-react), ghost variant, `hover:bg-primary/10 hover:text-primary`.
- Delete button: trash icon (`Trash2`), ghost variant, `hover:bg-destructive/10 hover:text-destructive`. Wrapped in an `AlertDialog` that says "Delete Record — This action cannot be undone. The record will be permanently deleted." with Cancel and Delete (destructive) buttons.
- Footer: Shows record count `"N record(s)"` when data is not empty.

---

### 5.2 FormField

**File:** `components/shared/FormField.jsx`

**Props:**
```ts
{
  label?:    string,
  required?: boolean,   // shows red asterisk after label
  error?:    string,    // shows ⚠ error below the field in red
  hint?:     string,    // shows grey hint below the field (hidden when error is shown)
  children:  ReactNode, // the actual input element
  className?: string,
}
```

```jsx
export default function FormField({ label, required, error, hint, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label className={cn("text-sm font-medium", error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {error  && <p className="text-xs text-destructive flex items-center gap-1"><span>⚠</span> {error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
```

---

## 6. Routing & Sidebar

### 6.1 Add routes to App.jsx / Router

```jsx
import AccessControl    from "@/pages/AccessControl";
import UserManagement   from "@/pages/UserManagement";

// Inside <Routes> wrapped in <ProtectedRoute>:
<Route path="/access-control"  element={<AccessControl />} />
<Route path="/user-management" element={<UserManagement />} />
```

### 6.2 Add to Sidebar navigation items

```js
// In your navItems array, add these two entries at the bottom:
{ path: "/access-control",  label: "Access Control",  icon: ShieldCheck },
{ path: "/user-management", label: "User Management", icon: UserCog     },
```

Both `ShieldCheck` and `UserCog` are from `lucide-react`.

---

## 7. Step-by-Step Build Order

Follow this exact order to avoid missing dependencies:

```
Step 1 → Create entities:
         Permission, PermissionGroup, Role, UserRole
         (User entity already exists)

Step 2 → Create shared components:
         components/shared/DataTable.jsx
         components/shared/FormField.jsx
         components/shared/PageHeader.jsx  (renders title + description + optional right-side children)

Step 3 → Create RBAC dialog forms (no data fetching, just form UI):
         components/rbac/PermissionFormDialog.jsx
         components/rbac/PermissionGroupFormDialog.jsx
         components/rbac/RoleFormDialog.jsx
         components/rbac/UserRoleFormDialog.jsx

Step 4 → Create RBAC tab components (data fetching + table + dialog wiring):
         components/rbac/PermissionsTab.jsx
         components/rbac/PermissionGroupsTab.jsx
         components/rbac/RolesTab.jsx
         components/rbac/UserRolesTab.jsx

Step 5 → Create Access Control page:
         pages/AccessControl.jsx
         (Just imports the 4 tabs and wraps them in <Tabs>)

Step 6 → Create User Management page:
         pages/UserManagement.jsx
         (Includes CreateUserDialog inline or as separate component)

Step 7 → Wire routing:
         Add both routes to App.jsx

Step 8 → Wire sidebar:
         Add both nav items to Sidebar.jsx
```

---

## 8. Runtime Permission Check (How to Use RBAC in Your App)

When you need to guard a UI element or a backend action:

```js
// Frontend utility function
async function userHasPermission(userId, permissionKey) {
  // 1. Fetch UserRole record for this user
  const userRoles = await api.entities.UserRole.filter({ user_id: userId });
  if (!userRoles.length) return false;

  const userRole = userRoles[0];
  if (!userRole.is_active) return false;

  // 2. Fetch all Roles assigned to the user
  const roles = await api.entities.Role.list();
  const assignedRoles = roles.filter(r => (userRole.role_ids || []).includes(r.id) && r.is_active);

  // 3. Collect all PermissionGroup IDs from those roles
  const groupIds = new Set();
  assignedRoles.forEach(r => (r.permission_group_ids || []).forEach(id => groupIds.add(id)));

  // 4. Fetch all PermissionGroups
  const groups = await api.entities.PermissionGroup.list();
  const assignedGroups = groups.filter(g => groupIds.has(g.id) && g.is_active);

  // 5. Collect all Permission IDs
  const permIds = new Set();
  assignedGroups.forEach(g => (g.permission_ids || []).forEach(id => permIds.add(id)));

  // 6. Fetch all Permissions and check
  const permissions = await api.entities.Permission.list();
  return permissions.some(p => permIds.has(p.id) && p.name === permissionKey);
}

// Usage:
const canReadFarms = await userHasPermission(currentUser.id, "farms:read");
if (!canReadFarms) return <Unauthorized />;
```

> **Performance tip:** Cache the resolved permission set per user session so you don't re-fetch on every check.

---

*End of specification. This document covers 100% of what is needed to implement the User Management and Access Control modules from scratch.*

---

## 9. Authentication & Authorization — Rules & Enforcement

> **This is the most critical section of the entire specification.**
> Authentication = who are you? Authorization = what are you allowed to do?
> These two must be enforced at every layer: routing, UI rendering, and data access.
> Copilot must implement ALL rules below without exception.

---

### 9.1 The Two-Layer Security Model

This system uses **two completely separate but complementary security layers**. They must both be active at the same time.

```
LAYER 1 — AUTHENTICATION (Platform / Base Role)
─────────────────────────────────────────────────
Handled by: the auth system (JWT session tokens)
Stored on:  User entity → field "role" → values: "admin" | "user"
Enforced by: ProtectedRoute component + sidebar visibility rules

LAYER 2 — AUTHORIZATION (Fine-grained RBAC)
─────────────────────────────────────────────────
Handled by: the RBAC chain (UserRole → Role → PermissionGroup → Permission)
Stored on:  UserRole entity (role_ids) → Role (permission_group_ids) → PermissionGroup (permission_ids) → Permission (name)
Enforced by: userHasPermission() utility + conditional UI rendering
```

**A user must pass BOTH layers to access anything.**

- Failing Layer 1 (not logged in) → redirect to `/login`.
- Failing Layer 1 (logged in but wrong base role) → show Unauthorized page or redirect.
- Failing Layer 2 (logged in, correct base role, but missing specific permission) → hide the UI element or show "Access Denied" inline.

---

### 9.2 Authentication Rules (Layer 1)

#### Rule A — Every page is protected by default

Every route except `/login`, `/register`, `/forgot-password`, and `/reset-password` must be wrapped in `<ProtectedRoute>`. If the user has no active session token, they are redirected to `/login` immediately. There are no exceptions.

```jsx
// In App.jsx — ALL app pages must sit inside this wrapper:
<Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
  <Route element={<AppLayout />}>
    <Route path="/"               element={<Dashboard />} />
    <Route path="/farms"          element={<Farms />} />
    <Route path="/access-control" element={<AccessControl />} />
    <Route path="/user-management" element={<UserManagement />} />
    {/* ... all other pages ... */}
  </Route>
</Route>
```

#### Rule B — Admin-only pages are doubly guarded

The pages `/access-control` and `/user-management` must ONLY be accessible to users whose `User.role === "admin"`. Enforcement must happen in TWO places simultaneously:

**Guard 1 — Sidebar visibility:** The nav items for Access Control and User Management must only be rendered when the current user's role is `"admin"`. A regular user must never see these links in the sidebar.

```jsx
// In Sidebar.jsx — wrap admin nav items:
{currentUser?.role === "admin" && (
  <>
    <NavItem path="/access-control"  label="Access Control"  icon={ShieldCheck} />
    <NavItem path="/user-management" label="User Management" icon={UserCog} />
  </>
)}
```

**Guard 2 — Route-level redirect:** Even if a regular user manually types `/access-control` into the browser address bar, the page component itself must check the user's role at mount time and redirect them away.

```jsx
// At the top of AccessControl.jsx and UserManagement.jsx:
const { currentUser } = useAuth();
useEffect(() => {
  if (currentUser && currentUser.role !== "admin") {
    navigate("/");  // or show an inline "Unauthorized" message
  }
}, [currentUser]);
```

#### Rule C — Session state must be loaded before rendering any protected content

The `AuthProvider` wraps the entire app. It fetches the current user's session asynchronously. While it is loading, show a full-screen spinner. Never render any page content before `isLoadingAuth` is `false`. This prevents flash-of-unauthorized-content.

```jsx
// In AuthenticatedApp (App.jsx):
if (isLoadingAuth || isLoadingPublicSettings) {
  return <FullScreenSpinner />;  // must block ALL content, not just parts of it
}
```

#### Rule D — After login, always hard-redirect

After a successful login or OTP verification, always use `window.location.href = "/"` (hard redirect), never React Router's `navigate()`. This forces the AuthProvider to re-initialize completely with the new session token. Using `navigate()` can result in stale auth state being read from memory.

#### Rule E — Logout clears the session completely

`base44.auth.logout()` must invalidate the session token both client-side and server-side. After logout, the user must NOT be able to press the browser back button and land back on a protected page. The ProtectedRoute handles this because it re-checks the session on every render.

---

### 9.3 Authorization Rules (Layer 2 — RBAC)

#### Rule F — The base role ("admin"/"user") is NOT a substitute for RBAC permissions

An admin user bypasses the sidebar guards, but they still need to go through Access Control to configure which data-level operations are allowed for regular users. Admin accounts are for system configuration only. Regular users do actual work, and their data access is controlled by the RBAC chain.

Do NOT write code like this:
```js
// WRONG — this bypasses RBAC entirely:
if (currentUser.role === "admin") return <AllData />;
```

Instead, check the actual RBAC permission:
```js
// CORRECT — always check the specific permission key:
const canRead = await userHasPermission(currentUser.id, "farms:read");
if (!canRead) return <AccessDenied />;
```

#### Rule G — The `is_active` flag is checked at every layer of the chain

The `userHasPermission()` function must check `is_active` on three separate entities before granting access. If ANY layer is inactive, the whole chain returns `false`:

1. `UserRole.is_active === false` → deny immediately, do not proceed deeper.
2. `Role.is_active === false` → skip that role, do not expand its groups.
3. `PermissionGroup.is_active === false` → skip that group, do not expand its permissions.

This gives the super admin the ability to freeze access at any layer without deleting records.

#### Rule H — No UserRole record = zero permissions

If a user account exists in the User table but has NO corresponding UserRole record, they have zero RBAC permissions. They can log in (auth passes) but they will see empty pages and blocked actions everywhere (authz fails). This is intentional and correct — access must be explicitly granted, never assumed.

#### Rule I — UI elements are hidden, not just disabled

When a user lacks a permission, the UI element (button, table row, form, tab) must be REMOVED from the DOM entirely using conditional rendering. Simply disabling a button is not sufficient because the user can inspect the DOM and re-enable it manually. Sensitive actions must not be rendered at all.

```jsx
// WRONG:
<Button disabled={!canWrite}>Save Record</Button>

// CORRECT:
{canWrite && <Button onClick={handleSave}>Save Record</Button>}
```

#### Rule J — Scope restrictions are enforced on data filtering, not just UI

When a PermissionGroup has `scope_type: "province"` or `scope_type: "farm"`, the `userHasPermission()` check alone is not enough. After confirming the user has e.g. `farms:read`, you must also check whether the specific farm they are trying to read is inside their allowed `scope_ids`.

```js
// Extended check for scoped access:
async function userCanAccessFarm(userId, farmId) {
  // 1. Standard permission check
  const canRead = await userHasPermission(userId, "farms:read");
  if (!canRead) return false;

  // 2. Get the user's permission groups that grant farms:read
  const groups = await getGroupsForUser(userId);  // helper that expands UserRole → Role → Groups
  const farmGroups = groups.filter(g => g.permission_ids includes farms:read permission);

  // 3. Check scope
  for (const group of farmGroups) {
    if (group.scope_type === "global") return true;  // global = access to all farms
    if (group.scope_type === "farm" && group.scope_ids.includes(farmId)) return true;
    if (group.scope_type === "province") {
      // fetch the farm, check if farm.province_id is in group.scope_ids
      const farm = await api.entities.Farm.get(farmId);
      if (group.scope_ids.includes(farm.province_id)) return true;
    }
  }
  return false;
}
```

#### Rule K — Never trust the frontend alone for security

The frontend RBAC checks are for UX (hiding/showing elements). They are NOT a security boundary. Any real data protection must also be enforced on the backend/database level with row-level security (RLS) rules or server-side permission checks. If your backend supports RLS, configure it to mirror the RBAC chain. Frontend checks are a convenience layer, not a security layer.

---

### 9.4 Authentication State Shape

The `useAuth()` hook must expose the following shape. Every component that needs to check auth/authz must use this hook and nothing else.

```ts
interface AuthContextValue {
  currentUser: {
    id: string;
    email: string;
    full_name: string;
    role: "admin" | "user";   // base platform role — for sidebar guards only
  } | null;
  isLoadingAuth: boolean;     // true while session is being verified
  isAuthenticated: boolean;   // false if no valid session exists
  authError: {
    type: "user_not_registered" | "auth_required" | null;
  } | null;
  navigateToLogin: () => void;
}
```

> **Critical:** `currentUser` must be `null` (not `undefined`, not `{}`) when there is no authenticated session. All auth checks must handle the `null` case explicitly.

---

### 9.5 What Happens at Every Lifecycle Event

| Event | Auth Action | RBAC Action |
|---|---|---|
| App loads | AuthProvider fetches session → sets `currentUser` or `null` | nothing yet |
| User visits protected route | ProtectedRoute checks `isAuthenticated` → redirect to `/login` if false | nothing yet |
| User visits admin-only route | Page checks `currentUser.role === "admin"` → redirect if false | nothing yet |
| Page fetches data | Data is fetched | `userHasPermission()` called per action/section — hide UI if false |
| User submits a form | Form fires mutation | check permission before firing — abort with toast if false |
| User logs out | Session token cleared, `currentUser = null` | All RBAC state cleared from memory automatically |
| Super admin deactivates UserRole | nothing changes in auth | `userHasPermission()` returns false for all checks at next page load |
| Super admin changes User.role to "user" | On next page load, sidebar hides admin links | Admin-only pages redirect away |

---

## 10. Full System Flow — Plain Narration (with Auth Highlighted)

> Read this section like a story. Every authentication and authorization decision is called out explicitly so there is no ambiguity about what should happen at each step.
> **[AUTH]** markers = authentication check. **[AUTHZ]** markers = authorization/permission check.

---

### Chapter 1 — A User Opens the App for the First Time (Unauthenticated)

The user opens the app in their browser. The React app boots. The `AuthProvider` immediately begins loading — it contacts the backend to check if there is a valid session token in the browser.

**[AUTH]** While the session is loading, `isLoadingAuth` is `true`. The entire app renders a full-screen spinner. No page content is shown at all. This is mandatory — it prevents the wrong page from flashing on screen before auth state is confirmed.

The session check resolves. No token is found. `isAuthenticated` becomes `false`, `currentUser` becomes `null`.

**[AUTH]** `ProtectedRoute` detects `isAuthenticated === false`. It immediately redirects the user to `/login`. The user never sees any protected page content.

The user fills in their email and password on the login page and submits. The auth system verifies the credentials against the database. If correct, a session token is issued and stored in the browser. On success, the code executes `window.location.href = "/"` — a hard redirect, not a React Router navigate. This forces the entire app to reload fresh so `AuthProvider` re-runs and picks up the new session token from scratch.

**[AUTH]** The app reloads. `AuthProvider` finds the valid token. `isAuthenticated = true`, `currentUser` is populated with the user's `id`, `email`, `full_name`, and `role`.

`ProtectedRoute` now allows the user through. The `AppLayout` and `Dashboard` page render.

---

### Chapter 2 — The Super Admin Configures the System for the First Time

The super admin's account has `User.role = "admin"`. This was set either at account creation time or manually via the User Management page.

**[AUTH]** The sidebar checks `currentUser?.role === "admin"`. Because this is true, the sidebar renders two extra nav items at the bottom: **Access Control** and **User Management**. A regular user (`role: "user"`) never sees these links — they are not rendered in the DOM at all, not just hidden with CSS.

The super admin clicks **Access Control**.

**[AUTH + AUTHZ]** The `AccessControl` page mounts. At the top of the component, a `useEffect` runs immediately:
```js
if (currentUser && currentUser.role !== "admin") navigate("/");
```
This is the second line of defense. Even if someone manually typed `/access-control` into the browser bar while logged in as a regular user, this redirect fires and sends them back to the dashboard. The sidebar guard is the first defense; this route-level guard is the second.

The page loads with four tabs. The super admin proceeds to configure the RBAC chain in order.

**Step 1 — Creating Permissions**

The super admin is on the Permissions tab. The table is empty. They click "Add Permission". A dialog opens. They fill in:
- Permission Key: `farms:read`
- Label: `View Farms`
- Module: `farms`
- Action: `read`

They click Create. The Permission record is saved to the database. The table refreshes and shows the new row.

They repeat for every permission the system needs: `farms:write`, `farms:delete`, `employees:read`, `employees:write`, `finance:read`, `finance:write`, `finance:manage`, `reports:read`, `audit_log:read`, `rbac:manage`.

**[AUTHZ — note]** These Permission records are purely descriptive. Creating them does NOT grant any user any access. They are just the vocabulary of the system. Access is only granted when they flow through: Group → Role → UserRole → User.

If the super admin needs to correct a permission, they click the row (opens edit dialog), fix it, and click Update. If they need to remove one, the trash icon on the row triggers a confirmation dialog before deleting.

**Step 2 — Creating Permission Groups**

The super admin moves to the Permission Groups tab. Empty. They click "Add Group".

They create a group named `Farm Viewers`, scope: `Global`, and tick only `farms:read`. This group, when eventually assigned to a user, grants them read access to all farm records across all provinces.

They create `Finance Team`, scope: `Global`, ticking `finance:read`, `finance:write`, `finance:manage`.

They create `Province A Farms Only`, scope: `Province-scoped`. A second checklist appears showing all province records from the database. They tick "Province A". They also tick `farms:read` and `employees:read`. 

**[AUTHZ — scope rule]** This group, when assigned to a user, means: that user can read farms AND employees, but ONLY if those farms/employees belong to Province A. The scope restriction is stored in `scope_ids` on the PermissionGroup record. It is the application's responsibility at runtime to filter data by these scope IDs before displaying it to the user.

**Step 3 — Creating Roles**

The super admin moves to the Roles tab. Empty. They click "Add Role".

They create `Farm Manager`. In the Permission Groups checklist they tick `Farm Viewers` and `Employee Readers`. They click Create.

They create `Finance Viewer`. They tick only `Finance Team`. They click Create.

They create `Province A Operator`. They tick only `Province A Farms Only`. They click Create.

**[AUTHZ — note]** Roles are still just configuration. No user has been given any of these roles yet. The chain is built but not connected to anyone.

**Step 4 — Assigning Roles to Users**

The super admin moves to the User Assignments tab. Empty. They click "Assign User".

A dropdown shows all registered user accounts pulled live from the User entity. They select "Ahmed Al-Rashidi — ahmed@company.com".

Below, they tick `Farm Manager`. A purple summary box confirms the selection. They click "Assign Roles".

A new UserRole record is created in the database:
```json
{
  "user_id": "ahmed-uuid",
  "user_email": "ahmed@company.com",
  "role_ids": ["farm-manager-role-uuid"],
  "is_active": true
}
```

**[AUTHZ — this is the moment access is actually granted]** The chain is now complete. Ahmed's account is connected to the Farm Manager role, which carries the Farm Viewers and Employee Readers groups, which carry the `farms:read` and `employees:read` permissions. From this moment on, whenever Ahmed's session is active and `userHasPermission("ahmed-uuid", "farms:read")` is called, it will return `true`.

The table now shows Ahmed's row with a purple "Farm Manager" badge and computed effective groups "Farm Viewers", "Employee Readers".

---

### Chapter 3 — The Super Admin Creates a New User Account

**[AUTH]** Only users with `User.role === "admin"` can see and use the User Management page. This is enforced by the sidebar guard AND the page-level redirect check.

The super admin navigates to **User Management**. The page shows three stat cards and the user list.

They click "Create User". A dialog opens. They fill in:
- Full Name: Fatima Al-Hassan
- Email: fatima@company.com
- Password: (at least 8 characters)
- Role: `user`

They click "Create User".

**[AUTH]** The account is created directly in the User entity — NOT through an invite flow. No email is sent. The account exists immediately. Fatima can log in right now using the credentials the admin just set.

**[AUTHZ — important gap]** Fatima's account now exists and she can authenticate (Layer 1). But she has NO UserRole record yet. When she logs in and navigates to Farms, `userHasPermission("fatima-uuid", "farms:read")` will return `false` because there is no UserRole record linking her to any role. She will see empty pages everywhere until the super admin goes to Access Control → User Assignments and assigns her a role.

The super admin must do this as a second step: go to User Assignments, click "Assign User", select Fatima, tick the appropriate role, and save.

---

### Chapter 4 — The Super Admin Promotes a User to Admin

**[AUTH]** This action changes Layer 1 security. The super admin is on User Management. They find a user row. In the Role column there is an inline Select dropdown showing "user". They change it to "admin".

The change saves immediately (`User.update(id, { role: "admin" })`). The row badge updates to amber "admin".

**[AUTH — consequence]** On the target user's next page load or next time their auth context re-fetches, `currentUser.role` will be `"admin"`. From that moment, the sidebar will render the Access Control and User Management links for them, and the admin-only page guard will pass.

To reverse this, the super admin changes the dropdown back to "user". On the demoted user's next page load, the admin nav links disappear and the page-level guard redirects them away from admin-only routes.

---

### Chapter 5 — The Super Admin Deletes a User Account

The super admin hovers over a user row on User Management. A trash icon appears (hidden at rest, visible on hover using `opacity-0 group-hover:opacity-100`). They click it.

A confirmation `AlertDialog` appears: "Remove User — This will permanently remove fatima@company.com from the system. This cannot be undone." They click Remove.

**[AUTH — consequence]** The User record is deleted. If Fatima is currently logged in, her session token still technically exists in her browser but will fail validation on the next protected API call. She will be redirected to `/login`.

**[AUTHZ — cleanup required]** Fatima's UserRole record still exists in the database but is now orphaned — it points to a `user_id` that no longer exists. It does not cause errors but it is dead data. The super admin should manually delete it from Access Control → User Assignments to keep the data clean.

---

### Chapter 6 — A Regular User (Ahmed) Logs In and Uses the System

Ahmed opens the app. **[AUTH]** `AuthProvider` loads. His session token is valid. `currentUser.role = "user"`.

**[AUTH]** The sidebar renders. Because `currentUser.role !== "admin"`, the Access Control and User Management nav items are NOT rendered. Ahmed cannot see them.

Ahmed navigates to `/access-control` by typing it manually in the browser.

**[AUTH]** The page mounts. The `useEffect` at the top runs: `currentUser.role !== "admin"` is true. `navigate("/")` fires. Ahmed is redirected to the dashboard. He never sees the page content.

Ahmed navigates to the Farms page. The page component mounts and calls:
```js
const canRead = await userHasPermission(currentUser.id, "farms:read");
```

**[AUTHZ]** Inside `userHasPermission`, the chain executes:
1. Fetch UserRole where `user_id === ahmed-uuid`. Found. `is_active === true`. Continue.
2. Get `role_ids` = `["farm-manager-role-uuid"]`. Fetch Roles. Filter to active ones. Found "Farm Manager". `is_active === true`. Continue.
3. Get `permission_group_ids` from Farm Manager = `["farm-viewers-uuid", "employee-readers-uuid"]`. Add to Set.
4. Fetch PermissionGroups. Filter to those in Set and `is_active === true`. Found both. Continue.
5. Collect all `permission_ids` from those groups. Add to Set.
6. Fetch Permissions. Filter to those in Set. Check if any has `name === "farms:read"`. Found it. Return `true`.

**[AUTHZ]** `canRead === true`. The Farms page renders its data table and shows Ahmed all farm records.

Ahmed tries to click "Add Farm" (which requires `farms:write`). The page calls `userHasPermission(id, "farms:write")`. Ahmed's groups only have `farms:read`. The check returns `false`.

**[AUTHZ]** The "Add Farm" button is NOT rendered. The DOM does not contain it at all. Ahmed sees no button to click.

Ahmed navigates to Finance. The page calls `userHasPermission(id, "finance:read")`. Ahmed has no finance permissions. Returns `false`. The entire finance data section is replaced with an "Access Denied" message.

---

### Chapter 7 — The Super Admin Temporarily Suspends Ahmed's Access

Ahmed is on leave. The super admin goes to Access Control → User Assignments. They click Ahmed's row to edit. They toggle `is_active` to `false` and save.

**[AUTHZ]** Ahmed is still authenticated. His session token is still valid. He can still reach the app and the pages load. BUT now `userHasPermission()` returns `false` for everything. At step 1 of the chain: `userRole.is_active === false` → return false immediately. No data is shown on any page. All action buttons are hidden. Ahmed's account is effectively frozen without being deleted and without touching any Role or Permission records.

When Ahmed returns from leave, the super admin sets `is_active` back to `true`. Access is restored the next time Ahmed's browser calls `userHasPermission()`.

---

### Chapter 8 — Updating the Permission Structure Without Breaking Existing Users

Six months later, the system adds a new "Inventory" module. The super admin:

1. Goes to Permissions tab. Creates `inventory:read`, `inventory:write`, `inventory:delete`. These are new Permission records. **[AUTHZ]** No one has access to them yet.

2. Goes to Permission Groups. Creates "Inventory Managers" group with `inventory:read` and `inventory:write`. **[AUTHZ]** Still no one has access — the group exists but is not part of any Role.

3. Goes to Roles. Clicks "Farm Manager" to edit. In the groups checklist they tick "Inventory Managers". Save.

**[AUTHZ — cascade effect]** From this moment, every user who has a UserRole record pointing to the "Farm Manager" role automatically gains `inventory:read` and `inventory:write`. No UserRole records were touched. No individual user records were edited. The change propagates through the chain automatically because the chain is resolved at runtime, not stored statically on the user.

This is the key architectural advantage of the layered RBAC system.

---

### Chapter 9 — Three-Level Access Revocation Without Deletion

The super admin has options for revoking access at three different levels:

**Level 1 — Revoke one user:** Set `UserRole.is_active = false` for that user. Only that user is affected. All other users with the same roles are unaffected.

**Level 2 — Revoke one role:** Set `Role.is_active = false` for a role. Every user who has that role in their `role_ids` loses the permissions it carried. Other roles the user holds still work normally.

**Level 3 — Revoke one permission group:** Set `PermissionGroup.is_active = false`. Every role that contained that group loses those permissions. Every user holding any of those roles loses that access.

**[AUTHZ]** In all three cases, the `userHasPermission()` function checks `is_active` at each layer as it traverses the chain. An inactive node at any layer stops the traversal and returns `false`. The user can still log in and see the app shell, but all data and action elements protected by those permissions disappear.

None of these operations delete any data. Everything is reversible by toggling `is_active` back to `true`.

---

### Final Summary — The Complete Auth + Authz Decision Tree

When any user attempts to do anything in the system, this decision tree runs:

```
1. Does the user have a valid session token?
   NO  → redirect to /login                            [AUTH LAYER]
   YES → continue

2. Is the target page admin-only?
   YES and currentUser.role !== "admin"
       → redirect to /                                 [AUTH LAYER]
   NO  → continue

3. Does the user have a UserRole record?
   NO  → deny, show "Access Denied" or empty state     [AUTHZ LAYER]
   YES → continue

4. Is UserRole.is_active === true?
   NO  → deny                                          [AUTHZ LAYER]
   YES → continue

5. Expand role_ids → filter active Roles
   Empty after filter → deny                           [AUTHZ LAYER]
   Continue

6. Expand permission_group_ids → filter active Groups
   Empty after filter → deny                           [AUTHZ LAYER]
   Continue

7. Expand permission_ids → check for matching name
   Not found → deny, hide UI element                  [AUTHZ LAYER]
   Found → ALLOW — render UI / execute action          [AUTHZ LAYER]

8. If permission group has scope restriction:
   Check if the target record's province/farm ID
   is inside scope_ids
   NO  → deny even though permission key matched       [AUTHZ LAYER]
   YES → ALLOW
```

**The full chain in one sentence:**

A **User** authenticates with a session token → the **ProtectedRoute** checks auth → the page checks base **role** for admin access → `userHasPermission()` walks **UserRole → Role → PermissionGroup → Permission** → if the permission `name` matches AND the `is_active` flags are all true AND scope_ids allow the record → access is granted.