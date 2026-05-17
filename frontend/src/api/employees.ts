import apiClient from "./client";
import type { PaginatedResponse, Employee } from "@/types";

export const getEmployees = async (
  params?: Record<string, string>
): Promise<PaginatedResponse<Employee>> => {
  const { data } = await apiClient.get("/employees/", { params });
  return data;
};

export const createEmployee = async (payload: {
  full_name: string;
  role: string;
  salary: number;
  farm: string;
  hire_date: string;
}) => {
  const { data } = await apiClient.post("/employees/", payload);
  return data;
};

export const updateEmployee = async (employeeId: string, payload: {
  full_name?: string;
  role?: string;
  salary?: number;
  farm?: string;
  status?: string;
  hire_date?: string;
}) => {
  const { data } = await apiClient.put(`/employees/${employeeId}/`, payload);
  return data;
};

export const deleteEmployee = async (employeeId: string) => {
  const { data } = await apiClient.delete(`/employees/${employeeId}/`);
  return data;
};
