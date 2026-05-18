// ── Users ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface UserCreatePayload {
  full_name: string;
  email: string;
  password: string;
}

export interface UserUpdatePayload {
  full_name?: string;
  email?: string;
  is_active?: boolean;
}

// ── Roles ─────────────────────────────────────────────────────────────────────
export interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  permissions?: string[];   // list of permission_key strings (detail view)
  created_at: string;
}

export interface RoleCreatePayload {
  name: string;
  description?: string;
  permission_ids?: string[];
}

export interface RoleUpdatePayload {
  name?: string;
  description?: string;
  is_active?: boolean;
  permission_ids?: string[];
}

// ── Permissions ───────────────────────────────────────────────────────────────
export interface Permission {
  id: string;
  permission_key: string;
  module: string;
  action: string;
  description: string;
  is_system: boolean;
  group: string;
  group_name: string;
  created_at: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

// ── User-Role assignment ──────────────────────────────────────────────────────
export interface UserRoleEntry {
  role_id: string;
  role_name: string;
}

export interface UserPermissionEntry {
  permission_id: string;
  permission_key: string;
}
