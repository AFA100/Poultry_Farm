import apiClient from "./client";
import type { PaginatedResponse, ApiResponse, Expense, Income, Capital } from "@/types";

// Expenses
export const getExpenses = async (params?: Record<string, string>): Promise<PaginatedResponse<Expense>> => {
  const { data } = await apiClient.get("/expenses/", { params });
  return data;
};
export const createExpense = async (payload: { farm: string; category: string; amount: number; expense_date: string; description?: string }): Promise<ApiResponse<Expense>> => {
  const { data } = await apiClient.post("/expenses/", payload);
  return data;
};
export const updateExpense = async (id: string, payload: Partial<{ farm: string; category: string; amount: number; expense_date: string; description: string }>): Promise<ApiResponse<Expense>> => {
  const { data } = await apiClient.put(`/expenses/${id}/`, payload);
  return data;
};
export const deleteExpense = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete(`/expenses/${id}/`);
  return data;
};

// Income
export const getIncome = async (params?: Record<string, string>): Promise<PaginatedResponse<Income>> => {
  const { data } = await apiClient.get("/incomes/", { params });
  return data;
};
export const createIncome = async (payload: { farm: string; source: string; amount: number; income_date: string; description?: string }): Promise<ApiResponse<Income>> => {
  const { data } = await apiClient.post("/incomes/", payload);
  return data;
};
export const updateIncome = async (id: string, payload: Partial<{ farm: string; source: string; amount: number; income_date: string; description: string }>): Promise<ApiResponse<Income>> => {
  const { data } = await apiClient.put(`/incomes/${id}/`, payload);
  return data;
};
export const deleteIncome = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete(`/incomes/${id}/`);
  return data;
};

// Capital
export const getCapital = async (params?: Record<string, string>): Promise<PaginatedResponse<Capital>> => {
  const { data } = await apiClient.get("/capitals/", { params });
  return data;
};
export const createCapital = async (payload: { farm: string; amount: number; investment_date: string; note?: string }): Promise<ApiResponse<Capital>> => {
  const { data } = await apiClient.post("/capitals/", payload);
  return data;
};
export const updateCapital = async (id: string, payload: Partial<{ farm: string; amount: number; investment_date: string; note: string }>): Promise<ApiResponse<Capital>> => {
  const { data } = await apiClient.put(`/capitals/${id}/`, payload);
  return data;
};
export const deleteCapital = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete(`/capitals/${id}/`);
  return data;
};
