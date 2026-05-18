import apiClient from "./client";
import type { PaginatedResponse } from "@/types";
import type { Permission, PermissionGroup } from "@/types/admin";

export const getPermissions = async (params?: Record<string, string>): Promise<PaginatedResponse<Permission>> => {
  const { data } = await apiClient.get("/permissions/", { params });
  return data;
};

export const getPermissionGroups = async (params?: Record<string, string>): Promise<PaginatedResponse<PermissionGroup>> => {
  const { data } = await apiClient.get("/permission-groups/", { params });
  return data;
};
