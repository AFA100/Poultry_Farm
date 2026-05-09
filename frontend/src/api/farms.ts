import apiClient from "./client";
import type { PaginatedResponse, Farm } from "@/types";

export const getFarms = async (params?: Record<string, string>): Promise<PaginatedResponse<Farm>> => {
  const { data } = await apiClient.get("/farms/", { params });
  return data;
};

export const getFarmDashboard = async (farmId: string) => {
  const { data } = await apiClient.get(`/dashboard/farm/${farmId}/`);
  return data;
};
