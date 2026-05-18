import apiClient from "./client";
import type { PaginatedResponse, ApiResponse } from "@/types";
import type { User, UserCreatePayload, UserUpdatePayload } from "@/types/admin";

export const getUsers = async (params?: Record<string, string>): Promise<PaginatedResponse<User>> => {
  const { data } = await apiClient.get("/users/", { params });
  return data;
};

export const createUser = async (payload: UserCreatePayload): Promise<ApiResponse<User>> => {
  const { data } = await apiClient.post("/users/", payload);
  return data;
};

export const updateUser = async (id: string, payload: UserUpdatePayload): Promise<ApiResponse<User>> => {
  const { data } = await apiClient.put(`/users/${id}/`, payload);
  return data;
};

export const deleteUser = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete(`/users/${id}/`);
  return data;
};

export const getUserRoles = async (userId: string) => {
  const { data } = await apiClient.get(`/users/${userId}/roles/`);
  return data;
};

export const assignUserRoles = async (userId: string, roleIds: string[]) => {
  const { data } = await apiClient.put(`/users/${userId}/roles/`, { role_ids: roleIds });
  return data;
};

export const getUserPermissions = async (userId: string) => {
  const { data } = await apiClient.get(`/users/${userId}/permissions/`);
  return data;
};

export const assignUserPermissions = async (userId: string, permissionIds: string[]) => {
  const { data } = await apiClient.put(`/users/${userId}/permissions/`, { permission_ids: permissionIds });
  return data;
};
