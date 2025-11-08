import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../actions/article-actions";
import type { DashboardStatsResponse } from "../lib/dto";

export function useDashboardStats() {
  return useQuery<DashboardStatsResponse>({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });
}
