"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type { StyleGuideResponse } from "@/features/onboarding/backend/schema";
import type { OnboardingFormData } from "@/features/onboarding/lib/onboarding-schema";

// ===== 스타일 가이드 목록 조회 =====
export function useListStyleGuides() {
  return useQuery({
    queryKey: ["styleGuides"],
    queryFn: async () => {
      const response = await apiClient.get("/api/style-guides");
      return (response.data || []) as StyleGuideResponse[];
    },
    staleTime: 60 * 1000, // 1분
    gcTime: 10 * 60 * 1000, // 10분
    refetchOnWindowFocus: false,
  });
}

// ===== 단일 스타일 가이드 조회 =====
export function useStyleGuide(guideId: string | null) {
  return useQuery({
    queryKey: ["styleGuides", guideId],
    queryFn: async () => {
      if (!guideId) throw new Error("Style guide ID is required");
      const response = await apiClient.get(`/api/style-guides/${guideId}`);
      return response.data as StyleGuideResponse;
    },
    enabled: !!guideId,
    staleTime: 60 * 1000, // 1분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// ===== 스타일 가이드 생성 =====
export function useCreateStyleGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const response = await apiClient.post("/api/style-guides", data);
      return response.data as StyleGuideResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["styleGuides"] });
    },
  });
}

// ===== 스타일 가이드 수정 =====
export function useUpdateStyleGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      guideId,
      data,
    }: {
      guideId: string;
      data: OnboardingFormData;
    }) => {
      const response = await apiClient.patch(
        `/api/style-guides/${guideId}`,
        data
      );
      return response.data as StyleGuideResponse;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["styleGuides"] });
      queryClient.invalidateQueries({
        queryKey: ["styleGuides", variables.guideId],
      });
    },
  });
}

// ===== 스타일 가이드 삭제 =====
export function useDeleteStyleGuide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guideId: string) => {
      const response = await apiClient.delete(`/api/style-guides/${guideId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["styleGuides"] });
    },
  });
}
