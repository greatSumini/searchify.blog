"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import type { ListArticlesQuery, ListArticlesResponse } from "../lib/dto";

type UseListArticlesOptions = {
  query?: Partial<ListArticlesQuery>;
  enabled?: boolean;
};

export function useListArticles(options: UseListArticlesOptions = {}) {
  const { query, enabled = true } = options;
  const { userId } = useAuth();

  return useQuery<ListArticlesResponse>({
    queryKey: ["articles", query],
    queryFn: async () => {
      try {
        const client = createAuthenticatedClient(userId);

        // Build query string
        const params = new URLSearchParams();
        if (query?.limit !== undefined) params.append("limit", String(query.limit));
        if (query?.offset !== undefined) params.append("offset", String(query.offset));
        if (query?.status) params.append("status", query.status);
        if (query?.sortBy) params.append("sortBy", query.sortBy);
        if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

        const queryString = params.toString();
        const url = `/api/articles${queryString ? `?${queryString}` : ""}`;

        const response = await client.get(url);
        return response.data as ListArticlesResponse;
      } catch (error) {
        const message = extractApiErrorMessage(error, "글 목록을 불러오는데 실패했습니다");
        throw new Error(message);
      }
    },
    enabled,
  });
}
