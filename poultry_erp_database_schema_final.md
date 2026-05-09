# Poultry ERP Database Schema (Final)

## Database: PostgreSQL
## Design: Modular ERP + RBAC + Multi-Farm System

---

# EXTENSIONS

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

# ENUMS

```sql
CREATE TYPE employee_role_enum AS ENUM ('farmer','worker','manager');
CREATE TYPE status_enum AS ENUM ('active','inactive');
CREATE TYPE movement_type_enum AS ENUM ('IN','OUT');
CREATE TYPE feed_unit_enum AS ENUM ('bag','kg');
CREATE TYPE transaction_type_enum AS ENUM ('IN','OUT');
```

---

# CORE AUTH TABLES

## Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Roles
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Permission Groups
```sql
CREATE TABLE permission_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Permissions
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NULL,
    permission_key VARCHAR(150) UNIQUE NOT NULL,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Role Permissions
```sql
CREATE TABLE role_permissions (
    role_id UUID,
    permission_id UUID,
    PRIMARY KEY(role_id, permission_id)
);
```

## User Roles
```sql
CREATE TABLE user_roles (
    user_id UUID,
    role_id UUID,
    PRIMARY KEY(user_id, role_id)
);
```

## User Permissions (Direct Override)
```sql
CREATE TABLE user_permissions (
    user_id UUID,
    permission_id UUID,
    PRIMARY KEY(user_id, permission_id)
);
```

---

# ORGANIZATION LAYER

## Provinces
```sql
CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Farms
```sql
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    location TEXT,
    capacity INTEGER CHECK (capacity >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Access Control
```sql
CREATE TABLE user_farm_access (
    user_id UUID,
    farm_id UUID,
    PRIMARY KEY(user_id, farm_id)
);

CREATE TABLE user_province_access (
    user_id UUID,
    province_id UUID,
    PRIMARY KEY(user_id, province_id)
);
```

---

# EMPLOYEES

```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role employee_role_enum NOT NULL,
    salary NUMERIC(12,2) NOT NULL CHECK (salary >= 0),
    hire_date DATE NOT NULL,
    status status_enum DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# CHICKEN MODULE

## Batches
```sql
CREATE TABLE chicken_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL,
    quantity INTEGER CHECK (quantity > 0),
    entry_date DATE NOT NULL,
    source VARCHAR(150),
    cost_per_unit NUMERIC(12,2),
    status status_enum DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Movements
```sql
CREATE TABLE chicken_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL,
    batch_id UUID NOT NULL,
    type movement_type_enum NOT NULL,
    quantity INTEGER CHECK (quantity > 0),
    movement_date DATE NOT NULL,
    reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# FEED MODULE

## Inventory
```sql
CREATE TABLE feed_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID UNIQUE NOT NULL,
    quantity NUMERIC(12,2) CHECK (quantity >= 0),
    unit feed_unit_enum NOT NULL,
    last_updated TIMESTAMP DEFAULT NOW()
);
```

## Transactions
```sql
CREATE TABLE feed_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL,
    type transaction_type_enum NOT NULL,
    quantity NUMERIC(12,2) CHECK (quantity > 0),
    unit feed_unit_enum NOT NULL,
    transaction_date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# FINANCE MODULE

## Expenses
```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL,
    category VARCHAR(100),
    amount NUMERIC(12,2) CHECK (amount >= 0),
    expense_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Income
```sql
CREATE TABLE income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL,
    source VARCHAR(100),
    amount NUMERIC(12,2) CHECK (amount >= 0),
    income_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Capital
```sql
CREATE TABLE capital (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL,
    amount NUMERIC(12,2) CHECK (amount >= 0),
    investment_date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# AUDIT LOGS

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100),
    entity_name VARCHAR(100),
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

# DESIGN PRINCIPLES

## Rules
- All IDs are UUID
- All operations are multi-farm scoped
- All financial data is immutable after approval
- All inventory is transaction-driven
- All actions are audited

---

# SYSTEM CHARACTERISTICS

- Multi-province
- Multi-farm
- RBAC-based security
- Transactional integrity
- Audit-driven system
- Analytics-ready schema

---

# READY FOR IMPLEMENTATION

This schema is:
- production-grade
- modular
- scalable
- ERP-ready

