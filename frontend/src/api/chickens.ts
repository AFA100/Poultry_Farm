import apiClient from "./client";
import type { PaginatedResponse, ChickenBatch, ChickenMovement } from "@/types";

export const getChickenBatches = async (
  params?: Record<string, string>
): Promise<PaginatedResponse<ChickenBatch>> => {
  const { data } = await apiClient.get("/chicken-batches/", { params });
  return data;
};

export const getChickenMovements = async (
  params?: Record<string, string>
): Promise<PaginatedResponse<ChickenMovement>> => {
  const { data } = await apiClient.get("/chicken-movements/", { params });
  return data;
};
