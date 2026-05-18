import apiClient from "./client";
import type { PaginatedResponse, ApiResponse, ChickenBatch, ChickenMovement } from "@/types";

export const getChickenBatches = async (params?: Record<string, string>): Promise<PaginatedResponse<ChickenBatch>> => {
  const { data } = await apiClient.get("/chicken-batches/", { params });
  return data;
};

export const createChickenBatch = async (payload: {
  farm: string; quantity: number; entry_date: string; source?: string; cost_per_unit?: number;
}): Promise<ApiResponse<ChickenBatch>> => {
  const { data } = await apiClient.post("/chicken-batches/", payload);
  return data;
};

export const updateChickenBatch = async (id: string, payload: {
  farm?: string; quantity?: number; entry_date?: string; source?: string; cost_per_unit?: number; status?: string;
}): Promise<ApiResponse<ChickenBatch>> => {
  const { data } = await apiClient.put(`/chicken-batches/${id}/`, payload);
  return data;
};

export const deleteChickenBatch = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await apiClient.delete(`/chicken-batches/${id}/`);
  return data;
};

export const getChickenMovements = async (params?: Record<string, string>): Promise<PaginatedResponse<ChickenMovement>> => {
  const { data } = await apiClient.get("/chicken-movements/", { params });
  return data;
};

export const createChickenMovement = async (payload: {
  farm: string; batch_id: string; type: "IN" | "OUT"; quantity: number; movement_date: string; reason?: string;
}): Promise<ApiResponse<ChickenMovement>> => {
  const { data } = await apiClient.post("/chicken-movements/", payload);
  return data;
};
