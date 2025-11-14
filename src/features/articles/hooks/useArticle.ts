"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import type { ArticleResponse } from "../lib/dto";

export const useArticle = (articleId: string | null) => {
  const { userId } = useAuth();

  return useQuery<ArticleResponse, Error>({
    queryKey: ["article", articleId],
    queryFn: async () => {
      if (!articleId) {
        throw new Error("Article ID is required");
      }

      try {
        const client = createAuthenticatedClient(userId);
        const response = await client.get(`/api/articles/${articleId}`);
        return response.data as ArticleResponse;
      } catch (error) {
        const message = extractApiErrorMessage(error, "글을 불러오는데 실패했습니다");
        throw new Error(message);
      }
    },
    enabled: !!articleId,
  });
};
