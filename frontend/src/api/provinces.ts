import apiClient from "./client";
import type { PaginatedResponse, ApiResponse, Province } from "@/types";

export const getProvinces = async (params?: Record<string, string>): Promise<PaginatedResponse<Province>> => {
  const { data } = await apiClient.get("/provinces/", { params });
  return data;
};

export const createProvince = async (payload: { name: string }): Promise<ApiResponse<Province>> => {
  const { data } = await apiClient.post("/provinces/", payload);
  return data;
};

export const updateProvince = async (id: string, payload: { name: string }): Promise<ApiResponse<Province>> => {
  const { data } = await apiClient.put(`/provinces/${id}/`, payload);
  return data;
};

export const deleteProvince = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete(`/provinces/${id}/`);
  return data;
};
