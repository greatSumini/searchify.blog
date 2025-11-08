"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createArticleDraft } from "../actions/article-actions";
import type { CreateArticleRequest, ArticleResponse } from "../lib/dto";

export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation<ArticleResponse, Error, CreateArticleRequest>({
    mutationFn: createArticleDraft,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.setQueryData(["article", data.id], data);
    },
  });
};
