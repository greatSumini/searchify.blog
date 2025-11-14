"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient, extractApiErrorMessage } from "@/lib/remote/api-client";
import type { UpdateArticleRequest, ArticleResponse } from "../lib/dto";

interface UpdateArticleVariables {
  articleId: string;
  data: UpdateArticleRequest;
}

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation<ArticleResponse, Error, UpdateArticleVariables>({
    mutationFn: async ({ articleId, data }) => {
      try {
        const client = createAuthenticatedClient(userId);
        const response = await client.patch(`/api/articles/${articleId}`, data);
        return response.data as ArticleResponse;
      } catch (error) {
        const message = extractApiErrorMessage(error, "글 수정에 실패했습니다");
        throw new Error(message);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.setQueryData(["article", data.id], data);
    },
  });
};
