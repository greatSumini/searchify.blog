"use client";

import { useQuery } from "@tanstack/react-query";
import { getArticle } from "../actions/article-actions";
import type { ArticleResponse } from "../lib/dto";

export const useArticle = (articleId: string | null) => {
  return useQuery<ArticleResponse, Error>({
    queryKey: ["article", articleId],
    queryFn: () => {
      if (!articleId) {
        throw new Error("Article ID is required");
      }
      return getArticle(articleId);
    },
    enabled: !!articleId,
  });
};
