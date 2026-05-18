import apiClient from "./client";
import type { PaginatedResponse, ApiResponse, Farm } from "@/types";

export const getFarms = async (params?: Record<string, string>): Promise<PaginatedResponse<Farm>> => {
  const { data } = await apiClient.get("/farms/", { params });
  return data;
};

export const createFarm = async (payload: {
  name: string; province: string; location?: string; capacity?: number;
}): Promise<ApiResponse<Farm>> => {
  const { data } = await apiClient.post("/farms/", payload);
  return data;
};

export const updateFarm = async (id: string, payload: {
  name?: string; province?: string; location?: string; capacity?: number; is_active?: boolean;
}): Promise<ApiResponse<Farm>> => {
  const { data } = await apiClient.put(`/farms/${id}/`, payload);
  return data;
};

export const deleteFarm = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete(`/farms/${id}/`);
  return data;
};
