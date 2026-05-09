import apiClient from "./client";
import type { ApiResponse, GlobalDashboard } from "@/types";

export const getGlobalDashboard = async (): Promise<ApiResponse<GlobalDashboard>> => {
  const { data } = await apiClient.get("/dashboard/");
  return data;
};
