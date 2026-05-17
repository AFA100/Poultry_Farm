# Poultry ERP — Frontend Design & Functionality Specification

> **Purpose:** This document is the single source of truth for implementing the frontend of the Poultry ERP system in VS Code / local environment. Use it as a Copilot reference.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 (token-based) |
| UI Primitives | shadcn/ui (Radix UI) |
| Icons | lucide-react |
| Routing | react-router-dom v6 |
| Data Fetching | @tanstack/react-query v5 |
| Forms | Controlled state (useState) with custom validation |
| Charts | recharts |
| Animations | framer-motion, canvas (custom) |
| Fonts | Inter (Google Fonts) |

---

## 2. Color Palette — Warm Earthy Amber

All colors are defined as CSS HSL variables in `index.css` and mapped in `tailwind.config.js`.

### Light Mode Tokens

```css
--background:       38 40% 96%;   /* Warm cream */
--foreground:       25 35% 12%;   /* Deep chocolate text */
--card:             38 30% 98%;   /* Off-white warm card */
--card-foreground:  25 35% 12%;

--primary:          33 85% 45%;   /* Amber-orange #C87C14 */
--primary-foreground: 0 0% 100%;

--secondary:        35 25% 90%;   /* Pale sand */
--secondary-foreground: 25 35% 18%;

--muted:            36 20% 92%;   /* Warm light grey */
--muted-foreground: 30 15% 48%;   /* Warm mid grey */

--accent:           20 72% 52%;   /* Terracotta #D4622A */
--accent-foreground: 0 0% 100%;

--destructive:      0 72% 51%;    /* Red */
--border:           35 20% 85%;   /* Sandy border */
--input:            35 20% 85%;
--ring:             33 85% 45%;   /* Focus ring = primary */

/* Sidebar */
--sidebar-background: 25 45% 10%; /* Deep chocolate #2A1508 */
--sidebar-foreground: 35 30% 85%;
--sidebar-primary:    33 85% 50%;
--sidebar-accent:     25 40% 16%;
--sidebar-border:     25 30% 18%;
```

### Hex Quick Reference

| Token | Hex Approx | Usage |
|-------|-----------|-------|
| Primary | `#C87C14` | Buttons, links, active states, focus rings |
| Accent | `#D4622A` | Warning badges, secondary CTAs |
| Background | `#F7F2EC` | Page background |
| Card | `#FDFAF6` | Card/dialog backgrounds |
| Sidebar | `#2A1508` | Left navigation panel |
| Border | `#DDD0BC` | Card borders, input borders |
| Muted text | `#8A7560` | Labels, subtitles |

### Chart Colors
```
chart-1: hsl(33, 85%, 45%)  — Amber
chart-2: hsl(20, 72%, 52%)  — Terracotta
chart-3: hsl(43, 90%, 55%)  — Gold
chart-4: hsl(15, 60%, 40%)  — Dark rust
chart-5: hsl(50, 80%, 60%)  — Light yellow
```

---

## 3. Background — Floating Diamond Animation

The main content area has a **canvas-based animated diamond background**.

### Behavior
- **18 diamond shapes** (rotated squares/rhombuses) float upward slowly across the screen
- Each diamond drifts slightly left/right using a sine wave
- On **mouse hover proximity** (within ~160px): diamond border **glows amber/gold**, shines with shadow blur
- On **mouse leave**: glow smoothly **fades out** (eased transition, not instant)
- Diamonds wrap around when they exit the viewport

### Implementation (Canvas 2D)
```js
// Diamond shape
ctx.moveTo(0, -h/2);
ctx.lineTo(w, 0);
ctx.lineTo(0, h/2);
ctx.lineTo(-w, 0);
ctx.closePath();

// Glow on hover proximity
ctx.shadowColor = `rgba(240, 170, 50, ${glowAlpha})`;
ctx.shadowBlur = 20 + glowAlpha * 30;
ctx.strokeStyle = `rgba(255, 200, 80, ${glowAlpha * 0.9})`;
```

### Properties per Diamond
| Property | Range |
|----------|-------|
| Size | 40–130px |
| Base opacity | 0.04–0.11 |
| Float speed | 0.008–0.023 (% per frame) |
| Rotation speed | ±0.12 deg/frame |
| Glow fade speed | 0.08 lerp factor |

### Canvas Placement
```jsx
<canvas className="fixed inset-0 pointer-events-none z-0" />
// Sits behind all content. Content has relative z-10.
```

---

## 4. Layout & Navigation

### Shell Structure
```
┌─────────────────────────────────────────┐
│  Sidebar (w-64, collapsed: w-16)        │
│  fixed left, full height                │
│                                         │
│  Main (ml-64, p-6 lg:p-8)              │
│  max-w-[1600px] mx-auto                 │
│                                         │
│  DiamondBackground (fixed canvas z-0)   │
└─────────────────────────────────────────┘
```

### Sidebar
- Background: `bg-sidebar` (`#2A1508` dark chocolate)
- Width: `w-64` (collapsed: `w-16`) — toggle button at top
- Logo area: top padding, farm icon + app name
- Nav items: icon + label, `hover:bg-sidebar-accent`, active: `bg-sidebar-accent text-sidebar-primary`
- Bottom: user avatar + name
- Transition: `transition-all duration-300`

### Routes
| Path | Page |
|------|------|
| `/` | Dashboard |
| `/farms` | Farms |
| `/employees` | Employees |
| `/chickens` | Chicken Batches |
| `/feed` | Feed Management |
| `/finance` | Finance |
| `/reports` | Reports |
| `/audit-log` | Audit Log |

---

## 5. Typography

```css
font-family: 'Inter', sans-serif;

/* Scale */
Page title:     text-2xl lg:text-3xl font-bold
Section title:  text-lg font-semibold
Card label:     text-xs font-medium uppercase tracking-wider text-muted-foreground
Body:           text-sm
Small/hint:     text-xs text-muted-foreground
Stat value:     text-2xl lg:text-3xl font-bold
```

---

## 6. Components

### 6.1 PageHeader
```jsx
<PageHeader title="Farms" description="Manage your farm locations">
  <Button>Add Farm</Button>
</PageHeader>
```
- `flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8`
- Title: `text-2xl lg:text-3xl font-bold tracking-tight`
- Description: `text-muted-foreground mt-1 text-sm`

### 6.2 StatsCard
```jsx
<StatsCard title="Total Farms" value="12" icon={Building2} variant="default" trend={5} />
```
Variants:
| Variant | Gradient | Icon bg |
|---------|----------|---------|
| default | amber-500/8 | amber-500/15 text-amber-700 |
| accent | orange-500/10 | orange-500/15 text-orange-700 |
| info | yellow-500/8 | yellow-500/15 text-yellow-700 |
| warning | amber-700/8 | amber-700/15 text-amber-800 |

### 6.3 StatusBadge
```jsx
<StatusBadge status="active" />
```
| Status | Colors |
|--------|--------|
| active | amber-500/10 text-amber-700 |
| inactive | stone-400/10 text-stone-500 |
| farmer | orange-500/10 text-orange-700 |
| worker | yellow-500/10 text-yellow-700 |
| manager | amber-700/10 text-amber-800 |
| IN | amber-500/10 text-amber-700 |
| OUT | orange-600/10 text-orange-700 |

### 6.4 DataTable
```jsx
<DataTable
  columns={columns}
  data={rows}
  isLoading={isLoading}
  onRowClick={(row) => openEdit(row)}
  onDelete={(row) => deleteRecord(row.id)}
  emptyMessage="No records found"
/>
```

**Column definition:**
```js
{ key: "name", label: "Farm Name", render: (val, row) => <Badge>{val}</Badge> }
```

**Features:**
- Loading: skeleton rows (5 rows × columns)
- Empty state: centered icon + message
- Row hover: `hover:bg-muted/30 group`
- Actions column: appears on `group-hover` (opacity-0 → opacity-100)
  - Edit button: pencil icon, `hover:bg-primary/10 hover:text-primary`
  - Delete button: trash icon, `hover:bg-destructive/10 hover:text-destructive`
  - Delete triggers `AlertDialog` confirmation
- Footer: `{count} record(s)` in muted text
- Header: `text-xs uppercase tracking-wider font-semibold text-muted-foreground bg-muted/50`

---

## 7. Forms Design

### 7.1 FormField Wrapper
```jsx
<FormField label="Farm Name" required error={errors.name} hint="Used in all reports">
  <Input ... />
</FormField>
```

Structure:
```
label (+ * if required)
  └─ input/select/textarea
error message (text-destructive text-xs, shown if error)
hint text (text-muted-foreground text-xs, shown if no error)
```

### 7.2 Dialog Forms
All forms live inside `Dialog` → `DialogContent`:
```
DialogHeader
  DialogTitle: "Add Farm" / "Edit Farm"
  DialogDescription: "Fields marked * are required."

form (space-y-4)
  FormField rows
  [2-col grid for related fields]

DialogFooter (pt-3 border-t border-border)
  Cancel (variant="outline")
  Submit (context label: "Create Farm" / "Update Farm")
```

### 7.3 Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| Farm | name | Required |
| Farm | province_id | Required |
| Farm | capacity | ≥ 0 |
| Employee | full_name | Required |
| Employee | farm_id | Required |
| Employee | salary | ≥ 0 |
| ChickenBatch | farm_id | Required |
| ChickenBatch | quantity | > 0 |
| ChickenBatch | cost_per_unit | ≥ 0 |
| ChickenMovement | farm_id | Required |
| ChickenMovement | batch_id | Required |
| ChickenMovement | quantity | > 0 |
| ChickenMovement | movement_date | Required |
| FeedInventory | farm_id | Required |
| FeedInventory | quantity | ≥ 0 |
| FeedTransaction | farm_id | Required |
| FeedTransaction | quantity | > 0 |
| FeedTransaction | transaction_date | Required |
| Income | farm_id | Required |
| Income | source | Required |
| Income | amount | ≥ 0 |
| Expense | farm_id | Required |
| Expense | amount | ≥ 0 |
| Capital | farm_id | Required |
| Capital | amount | ≥ 0 |
| Capital | investment_date | Required |

### 7.4 Input Styling
```css
/* Normal */
border border-input bg-card rounded-md px-3 py-2 text-sm

/* Error state */
border-destructive  /* added when error exists */

/* Focus */
ring-1 ring-ring  /* ring = primary amber */
```

---

## 8. Entities & API Contract

Base URL: `/api/v1/`

All IDs are UUIDs. All timestamps are ISO 8601.

### 8.1 Province
```
GET    /api/v1/provinces/
POST   /api/v1/provinces/
PUT    /api/v1/provinces/{id}/
DELETE /api/v1/provinces/{id}/
```
Fields: `id`, `name` (unique), `is_active` (bool), `created_date`

### 8.2 Farm
```
GET    /api/v1/farms/
POST   /api/v1/farms/
PUT    /api/v1/farms/{id}/
DELETE /api/v1/farms/{id}/
```
Fields: `id`, `province_id` (FK), `name`, `location`, `capacity` (int ≥ 0), `is_active`, `created_date`

### 8.3 Employee
```
GET    /api/v1/employees/
POST   /api/v1/employees/
PUT    /api/v1/employees/{id}/
DELETE /api/v1/employees/{id}/
```
Fields: `id`, `farm_id` (FK), `full_name`, `role` (enum: farmer|worker|manager), `salary` (decimal), `hire_date` (date), `status` (enum: active|inactive), `is_active`, `created_date`

### 8.4 ChickenBatch
```
GET    /api/v1/chicken-batches/
POST   /api/v1/chicken-batches/
PUT    /api/v1/chicken-batches/{id}/
DELETE /api/v1/chicken-batches/{id}/
```
Fields: `id`, `farm_id`, `quantity` (int > 0), `entry_date` (date), `source` (str), `cost_per_unit` (decimal), `status` (active|inactive), `is_active`

### 8.5 ChickenMovement
```
GET    /api/v1/chicken-movements/
POST   /api/v1/chicken-movements/
```
Fields: `id`, `farm_id`, `batch_id` (FK ChickenBatch), `type` (IN|OUT), `quantity` (int > 0), `movement_date` (date), `reason` (str optional)

### 8.6 FeedInventory
```
GET    /api/v1/feed-inventory/
POST   /api/v1/feed-inventory/
PUT    /api/v1/feed-inventory/{id}/
```
Fields: `id`, `farm_id` (unique), `quantity` (decimal ≥ 0), `unit` (enum: kg|bag), `is_active`

### 8.7 FeedTransaction
```
GET    /api/v1/feed-transactions/
POST   /api/v1/feed-transactions/
```
Fields: `id`, `farm_id`, `type` (IN|OUT), `quantity` (decimal > 0), `unit` (kg|bag), `transaction_date` (date), `note` (str optional)

### 8.8 Income
```
GET    /api/v1/incomes/
POST   /api/v1/incomes/
PUT    /api/v1/incomes/{id}/
DELETE /api/v1/incomes/{id}/
```
Fields: `id`, `farm_id`, `source` (str), `amount` (decimal ≥ 0), `income_date` (date), `description` (str), `is_active`

### 8.9 Expense
```
GET    /api/v1/expenses/
POST   /api/v1/expenses/
PUT    /api/v1/expenses/{id}/
DELETE /api/v1/expenses/{id}/
```
Fields: `id`, `farm_id`, `category` (str), `amount` (decimal ≥ 0), `expense_date` (date), `description` (str), `is_active`

### 8.10 Capital
```
GET    /api/v1/capitals/
POST   /api/v1/capitals/
PUT    /api/v1/capitals/{id}/
DELETE /api/v1/capitals/{id}/
```
Fields: `id`, `farm_id`, `amount` (decimal ≥ 0), `investment_date` (date), `note` (str), `is_active`

### 8.11 AuditLog
```
GET    /api/v1/audit-logs/
```
Fields: `id`, `user_id`, `action` (str), `entity_name` (str), `entity_id` (UUID), `metadata` (JSON), `created_date`

---

## 9. Page-by-Page Functionality

### Dashboard (`/`)
- Stats cards: Total Farms, Active Batches, Total Feed Stock, Net Balance (income - expense)
- Bar chart: Monthly income vs expenses (recharts BarChart)
- Pie chart: Expenses by category (recharts PieChart)
- Recent Batches list (last 5)
- Recent Expenses list (last 5)

### Farms (`/farms`)
- Table: name, province, location, capacity, status, created date
- Add/Edit form dialog
- Delete with confirmation

### Employees (`/employees`)
- Table: name, farm, role (badge), salary, hire date, status
- Add/Edit form dialog
- Delete with confirmation

### Chicken Batches (`/chickens`)
- Tabbed view: **Batches** | **Movements**
- Batches table: farm, quantity, entry date, source, cost/unit, status
- Movements table: farm, batch, type (IN/OUT badge), quantity, date, reason
- Add batch dialog
- Record movement dialog (batch dropdown filtered by selected farm)
- Delete batch with confirmation

### Feed Management (`/feed`)
- Tabbed view: **Inventory** | **Transactions**
- Inventory: farm, quantity, unit — edit to set stock level
- Transactions: farm, type, quantity, unit, date, note
- Add/edit inventory dialog
- Record transaction dialog

### Finance (`/finance`)
- Tabbed view: **Income** | **Expenses** | **Capital**
- Each tab: table with farm, amount, date, category/source
- Unified `TransactionFormDialog` switching mode by `type` prop
- Delete with confirmation for all three

### Reports (`/reports`)
- Summary charts per farm
- Date range filter
- Export-ready layout

### Audit Log (`/audit-log`)
- Read-only table
- Columns: timestamp, action (color-coded badge), entity, record ID, user
- Color codes: create=green, update=blue, delete=red

---

## 10. Frontend State Patterns

### Data Fetching (React Query)
```js
const { data: farms = [], isLoading } = useQuery({
  queryKey: ["farms"],
  queryFn: () => fetch("/api/v1/farms/").then(r => r.json()),
});
```

### Mutations
```js
const createMutation = useMutation({
  mutationFn: (data) => fetch("/api/v1/farms/", { method: "POST", body: JSON.stringify(data) }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["farms"] });
    setDialogOpen(false);
  },
});
```

### Form Pattern
```js
const [form, setForm] = useState({ name: "", province_id: "" });
const [errors, setErrors] = useState({});

const validate = () => {
  const e = {};
  if (!form.name.trim()) e.name = "Required";
  return e;
};

const handleSubmit = (e) => {
  e.preventDefault();
  const errs = validate();
  if (Object.keys(errs).length) { setErrors(errs); return; }
  mutation.mutate(form);
};

const set = (field, val) => {
  setForm(f => ({ ...f, [field]: val }));
  setErrors(er => ({ ...er, [field]: undefined })); // clear on change
};
```

---

## 11. API Client Setup (Axios recommended)

```js
// api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Add auth token if needed
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## 12. Tailwind Config Mapping

```js
// tailwind.config.js
theme: {
  extend: {
    fontFamily: { inter: ["var(--font-inter)"] },
    colors: {
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
      secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
      muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
      accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
      destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
      card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      sidebar: {
        DEFAULT: "hsl(var(--sidebar-background))",
        foreground: "hsl(var(--sidebar-foreground))",
        primary: "hsl(var(--sidebar-primary))",
        accent: "hsl(var(--sidebar-accent))",
        border: "hsl(var(--sidebar-border))",
      },
    },
  },
}
```

---

*Last updated: 2026-05-17 — Poultry ERP v1.0*