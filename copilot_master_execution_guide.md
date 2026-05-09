# Copilot Master Execution Guide (Poultry ERP)

## PURPOSE
This document is the **single entry point for Copilot and developers**.

It defines:
- required file reading order
- development phases
- system startup procedure
- modular execution strategy
- safety rules for schema + RBAC compliance

This is an **ERP-grade multi-farm system** and must be treated as production-critical software.

---

# 🔴 ABSOLUTE RULE

Copilot MUST NOT generate or modify code unless it has first read ALL required files in strict order.

If any file is missing or unclear → STOP execution immediately.

---

# 📚 REQUIRED CORE FILES (MANDATORY READ ORDER)

## 1. ARCHITECTURE BLUEPRINT (SYSTEM LOGIC)
📄 File:
`poultry_erp_architecture_blueprint.md`

### PURPOSE
Defines:
- business rules
- system modules
- RBAC logic
- dashboard structure
- API strategy
- overall system behavior

👉 This is the **business brain of the system**

---

## 2. DATABASE SCHEMA (SOURCE OF TRUTH)
📄 File:
`poultry_erp_database_schema_final.md`

### PURPOSE
Defines:
- all tables
- all fields
- all relationships
- all constraints
- enums

### RULES
- NO field modifications allowed
- NO missing constraints allowed
- NO renaming entities allowed
- NO extra tables without updating schema file first

👉 This is the **data backbone of the system**

---

## 3. COPILOT DEVELOPMENT GUIDELINES (ENGINEERING RULES)
📄 File:
`copilot_development_guidelines_and_execution_plan.md`

### PURPOSE
Defines:
- backend folder structure
- modular architecture rules
- service layer pattern
- selector pattern
- API standards
- RBAC enforcement
- coding discipline

👉 This is the **engineering constitution**

---

# 🧠 SYSTEM BOOT SEQUENCE (MANDATORY)

Copilot MUST ALWAYS execute in this order:

## STEP 1 — SYSTEM UNDERSTANDING
Read:
1. `poultry_erp_architecture_blueprint.md`

Outcome:
- understand system modules
- understand workflows
- understand business rules

---

## STEP 2 — DATA MODEL VALIDATION
Read:
2. `poultry_erp_database_schema_final.md`

Outcome:
- understand all entities
- understand relationships
- understand constraints

---

## STEP 3 — ENGINEERING RULES
Read:
3. `copilot_development_guidelines_and_execution_plan.md`

Outcome:
- understand structure rules
- understand service/selector layers
- understand RBAC enforcement

---

# 🚀 PHASED DEVELOPMENT STRATEGY (MANDATORY)

Work MUST be executed in controlled phases to prevent overload and ensure stability.

---

# PHASE 0 — PROJECT INITIALIZATION

## Goals:
- Django setup
- PostgreSQL connection
- DRF setup
- environment setup
- Docker setup

## Output:
- running backend server
- base project structure

---

# PHASE 1 — AUTH + RBAC CORE

## Modules:
- users
- authentication
- roles
- permissions
- RBAC middleware

## Rules:
- ALL endpoints must enforce permissions
- RBAC must be functional before any business module

---

# PHASE 2 — ORGANIZATION STRUCTURE

## Modules:
- provinces
- farms
- access control (farm/province mapping)

## Output:
- multi-farm isolation working

---

# PHASE 3 — CORE OPERATIONS

## Modules:
- employees
- chickens
- chicken movements
- feed inventory
- feed transactions

## Rules:
- all inventory must be transaction-driven
- no direct quantity edits allowed

---

# PHASE 4 — FINANCE MODULE

## Modules:
- expenses
- income
- capital

## Rules:
- financial immutability after approval
- audit logging required

---

# PHASE 5 — DASHBOARDS + REPORTING

## Modules:
- dashboards
- analytics
- reports
- selectors

## Rules:
- all metrics must come from selectors
- no frontend calculations allowed

---

# PHASE 6 — OPTIMIZATION LAYER

## Modules:
- caching (Redis)
- background jobs (Celery)
- query optimization
- performance tuning

---

# ⚙️ MODULAR ARCHITECTURE RULE

Each domain MUST be a separate Django app:

DO NOT:
- mix domains in one app
- create monolithic models.py

DO:
- one app per business domain
- isolated services
- isolated selectors

---

# 🧩 LAYER RESPONSIBILITY RULE

## Views
- request handling only
- NO business logic

## Services
- business logic
- transactions

## Selectors
- database queries
- analytics queries

## Models
- schema only

---

# 🔐 RBAC RULE (NON-NEGOTIABLE)

Every API must validate:
1. authentication
2. user active
3. role permissions
4. direct permissions
5. farm access
6. province access

---

# ❌ FORBIDDEN ACTIONS

Copilot MUST NEVER:
- bypass schema
- bypass RBAC
- write logic in views
- create unstructured apps
- modify schema without update file

---

# ✅ REQUIRED BEHAVIOR

Copilot MUST ALWAYS:
- follow schema exactly
- follow modular architecture
- enforce RBAC everywhere
- use services for logic
- use selectors for queries
- ensure audit logging

---

# 🧭 FINAL PRINCIPLE

This system is:
- ERP-grade
- multi-tenant (farm-based)
- finance-critical
- analytics-driven
- audit-compliant

All development must preserve:
- correctness
- scalability
- traceability
- modularity

---

# END OF GUIDE

