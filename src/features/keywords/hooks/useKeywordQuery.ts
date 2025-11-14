'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { KeywordListResponse, Keyword, KeywordSuggestionsResponse } from '@/features/keywords/lib/dto';

// ===== 키워드 목록 조회 =====
export function useKeywordList(query?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['keywords', 'list', query, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get(`/api/keywords?${params.toString()}`);
      return response.data as KeywordListResponse;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ===== 키워드 생성 =====
export function useCreateKeyword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phrase: string) => {
      const response = await apiClient.post('/api/keywords', { phrase });
      return response.data as Keyword;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords', 'list'] });
    },
  });
}

// ===== 키워드 연관 검색어 조회 =====
export function useKeywordSuggestions() {
  return useMutation({
    mutationFn: async (params: {
      seeds: string[];
      languageName?: string;
      locationCode?: number;
      limit?: number;
      forceRefresh?: boolean;
    }) => {
      const response = await apiClient.post('/api/keywords/suggestions', params);
      return response.data as KeywordSuggestionsResponse;
    },
  });
}

// ===== 키워드 일괄 생성 =====
export function useBulkCreateKeywords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phrases: string[]) => {
      const response = await apiClient.post('/api/keywords/bulk', { phrases });
      return response.data as { created: number; skipped: number; keywords: Keyword[] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords', 'list'] });
    },
  });
}
