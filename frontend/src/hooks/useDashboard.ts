import { useQuery } from "@tanstack/react-query";
import { getGlobalDashboard, getProvinceDashboard, getFarmDashboardData } from "@/api/dashboard";

export const useGlobalDashboard = () =>
  useQuery({
    queryKey: ["global-dashboard"],
    queryFn: getGlobalDashboard,
    staleTime: 1000 * 60 * 5,
  });

export const useProvinceDashboard = (provinceId: string) =>
  useQuery({
    queryKey: ["province-dashboard", provinceId],
    queryFn: () => getProvinceDashboard(provinceId),
    enabled: !!provinceId,
    staleTime: 1000 * 60 * 5,
  });

export const useFarmDashboard = (farmId: string) =>
  useQuery({
    queryKey: ["farm-dashboard", farmId],
    queryFn: () => getFarmDashboardData(farmId),
    enabled: !!farmId,
    staleTime: 1000 * 60 * 5,
  });
