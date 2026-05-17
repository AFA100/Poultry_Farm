import apiClient from "./client";
import type { PaginatedResponse, Expense, Income, Capital } from "@/types";

export const getExpenses = async (
  params?: Record<string, string>
): Promise<PaginatedResponse<Expense>> => {
  const { data } = await apiClient.get("/expenses/", { params });
  return data;
};

export const getIncome = async (
  params?: Record<string, string>
): Promise<PaginatedResponse<Income>> => {
  const { data } = await apiClient.get("/income/", { params });
  return data;
};

export const getCapital = async (
  params?: Record<string, string>
): Promise<PaginatedResponse<Capital>> => {
  const { data } = await apiClient.get("/capital/", { params });
  return data;
};
