import apiClient from "./client";
import type { ApiResponse } from "@/types";

export const getProfitLossReport = async (
  params?: Record<string, string>
): Promise<ApiResponse<Record<string, unknown>>> => {
  const { data } = await apiClient.get("/reports/profit-loss/", { params });
  return data;
};
