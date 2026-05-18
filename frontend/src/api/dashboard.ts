import apiClient from "./client";
import type { ApiResponse, GlobalDashboard, ProvinceDashboard, FarmDashboard } from "@/types";

export const getGlobalDashboard = async (): Promise<ApiResponse<GlobalDashboard>> => {
  const { data } = await apiClient.get("/dashboard/");
  return data;
};

export const getProvinceDashboard = async (provinceId: string): Promise<ApiResponse<ProvinceDashboard>> => {
  const { data } = await apiClient.get(`/dashboard/province/${provinceId}/`);
  return data;
};

export const getFarmDashboardData = async (farmId: string): Promise<ApiResponse<FarmDashboard>> => {
  const { data } = await apiClient.get(`/dashboard/farm/${farmId}/`);
  return data;
};
