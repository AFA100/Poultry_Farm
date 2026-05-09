import { useQuery } from "@tanstack/react-query";
import { getGlobalDashboard } from "@/api/dashboard";

export const useGlobalDashboard = () =>
  useQuery({
    queryKey: ["global-dashboard"],
    queryFn: getGlobalDashboard,
    staleTime: 1000 * 60 * 5,
  });
