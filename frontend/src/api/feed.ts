import apiClient from "./client";
import type { PaginatedResponse, ApiResponse, FeedInventory, FeedTransaction } from "@/types";

export const getFeedInventory = async (params?: Record<string, string>): Promise<PaginatedResponse<FeedInventory>> => {
  const { data } = await apiClient.get("/feed-inventory/", { params });
  return data;
};

export const createFeedInventory = async (payload: {
  farm: string; quantity: number; unit: "kg" | "bag";
}): Promise<ApiResponse<FeedInventory>> => {
  const { data } = await apiClient.post("/feed-inventory/", payload);
  return data;
};

export const updateFeedInventory = async (id: string, payload: {
  farm?: string; quantity?: number; unit?: "kg" | "bag";
}): Promise<ApiResponse<FeedInventory>> => {
  const { data } = await apiClient.put(`/feed-inventory/${id}/`, payload);
  return data;
};

export const getFeedTransactions = async (params?: Record<string, string>): Promise<PaginatedResponse<FeedTransaction>> => {
  const { data } = await apiClient.get("/feed-transactions/", { params });
  return data;
};

export const createFeedTransaction = async (payload: {
  farm: string; type: "IN" | "OUT"; quantity: number; unit: "kg" | "bag"; transaction_date: string; note?: string;
}): Promise<ApiResponse<FeedTransaction>> => {
  const { data } = await apiClient.post("/feed-transactions/", payload);
  return data;
};
