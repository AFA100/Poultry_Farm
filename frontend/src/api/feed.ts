import apiClient from "./client";
import type { PaginatedResponse, FeedInventory, FeedTransaction } from "@/types";

export const getFeedInventory = async (
  params?: Record<string, string>
): Promise<PaginatedResponse<FeedInventory>> => {
  const { data } = await apiClient.get("/feed-inventory/", { params });
  return data;
};

export const getFeedTransactions = async (
  params?: Record<string, string>
): Promise<PaginatedResponse<FeedTransaction>> => {
  const { data } = await apiClient.get("/feed-transactions/", { params });
  return data;
};
