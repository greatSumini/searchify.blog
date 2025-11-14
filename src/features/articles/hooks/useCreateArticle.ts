"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import type { CreateArticleRequest, ArticleResponse } from "../lib/dto";

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation<ArticleResponse, Error, CreateArticleRequest>({
    mutationFn: async (data) => {
      try {
        const client = createAuthenticatedClient(userId);
        const response = await client.post("/api/articles/draft", data);
        return response.data as ArticleResponse;
      } catch (error) {
        const message = extractApiErrorMessage(error, "글 작성에 실패했습니다");
        throw new Error(message);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.setQueryData(["article", data.id], data);
    },
  });
};
