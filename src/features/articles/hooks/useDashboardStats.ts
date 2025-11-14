"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import type { DashboardStatsResponse } from "../lib/dto";

export function useDashboardStats() {
  const { userId } = useAuth();

  return useQuery<DashboardStatsResponse>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      try {
        const client = createAuthenticatedClient(userId);
        const response = await client.get("/api/articles/stats");
        return response.data as DashboardStatsResponse;
      } catch (error) {
        const message = extractApiErrorMessage(error, "대시보드 통계를 불러오는데 실패했습니다");
        throw new Error(message);
      }
    },
  });
}
