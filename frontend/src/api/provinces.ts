import apiClient from "./client";
import type { PaginatedResponse, Province } from "@/types";

export const getProvinces = async (): Promise<PaginatedResponse<Province>> => {
  const { data } = await apiClient.get("/provinces/");
  return data;
};

export const createProvince = async (name: string) => {
  const { data } = await apiClient.post("/provinces/", { name });
  return data;
};
