"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserStyleGuide } from "../actions/article-actions";

export interface StyleGuideData {
  id: string;
  clerkUserId: string;
  brandName: string;
  brandDescription: string;
  personality: string[];
  formality: "casual" | "neutral" | "formal";
  targetAudience: string;
  painPoints: string;
  language: "ko" | "en";
  tone: "professional" | "friendly" | "inspirational" | "educational";
  contentLength: "short" | "medium" | "long";
  readingLevel: "beginner" | "intermediate" | "advanced";
  notes: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useStyleGuide = () => {
  return useQuery<StyleGuideData, Error>({
    queryKey: ["styleGuide"],
    queryFn: getUserStyleGuide,
  });
};
