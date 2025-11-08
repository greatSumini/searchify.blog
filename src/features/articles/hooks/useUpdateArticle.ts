"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateArticleDraft } from "../actions/article-actions";
import type { UpdateArticleRequest, ArticleResponse } from "../lib/dto";

interface UpdateArticleVariables {
  articleId: string;
  data: UpdateArticleRequest;
}

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation<ArticleResponse, Error, UpdateArticleVariables>({
    mutationFn: ({ articleId, data }) => updateArticleDraft(articleId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.setQueryData(["article", data.id], data);
    },
  });
};
