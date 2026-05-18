import apiClient from "./client";
import type { PaginatedResponse, ApiResponse } from "@/types";
import type { Role, RoleCreatePayload, RoleUpdatePayload } from "@/types/admin";

export const getRoles = async (params?: Record<string, string>): Promise<PaginatedResponse<Role>> => {
  const { data } = await apiClient.get("/roles/", { params });
  return data;
};

export const getRole = async (id: string): Promise<ApiResponse<Role>> => {
  const { data } = await apiClient.get(`/roles/${id}/`);
  return data;
};

export const createRole = async (payload: RoleCreatePayload): Promise<ApiResponse<Role>> => {
  const { data } = await apiClient.post("/roles/", payload);
  return data;
};

export const updateRole = async (id: string, payload: RoleUpdatePayload): Promise<ApiResponse<Role>> => {
  const { data } = await apiClient.patch(`/roles/${id}/`, payload);
  return data;
};

export const deleteRole = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete(`/roles/${id}/`);
  return data;
};
