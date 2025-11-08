"use server";

import { auth } from "@clerk/nextjs/server";
import type { CreateArticleRequest, UpdateArticleRequest } from "../lib/dto";

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Create a new article draft
 */
export async function createArticleDraft(data: CreateArticleRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(`${API_BASE_URL}/api/articles/draft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-clerk-user-id": userId,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to create article draft:", errorData);
      throw new Error(
        errorData.error?.message || "글 작성에 실패했습니다"
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating article draft:", error);
    throw new Error(
      error instanceof Error ? error.message : "글 작성 중 오류가 발생했습니다"
    );
  }
}

/**
 * Update an existing article draft
 */
export async function updateArticleDraft(
  articleId: string,
  data: UpdateArticleRequest
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-clerk-user-id": userId,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to update article draft:", errorData);
      throw new Error(
        errorData.error?.message || "글 수정에 실패했습니다"
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating article draft:", error);
    throw new Error(
      error instanceof Error ? error.message : "글 수정 중 오류가 발생했습니다"
    );
  }
}

/**
 * Get an article by ID
 */
export async function getArticle(articleId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}`, {
      method: "GET",
      headers: {
        "x-clerk-user-id": userId,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to get article:", errorData);
      throw new Error(
        errorData.error?.message || "글을 불러오는데 실패했습니다"
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error getting article:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "글을 불러오는 중 오류가 발생했습니다"
    );
  }
}

/**
 * Get user's style guide
 */
export async function getUserStyleGuide() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/style-guides/${userId}`,
      {
        method: "GET",
        headers: {
          "x-clerk-user-id": userId,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to get style guide:", errorData);
      throw new Error(
        errorData.error?.message || "스타일 가이드를 불러오는데 실패했습니다"
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error getting style guide:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "스타일 가이드를 불러오는 중 오류가 발생했습니다"
    );
  }
}
