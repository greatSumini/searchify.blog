"use server";

import { auth } from "@clerk/nextjs/server";
import type {
  CreateArticleRequest,
  UpdateArticleRequest,
  ListArticlesQuery,
} from "../lib/dto";

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * @deprecated Use useCreateArticle hook with apiClient instead
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
    return result;
  } catch (error) {
    console.error("Error creating article draft:", error);
    throw new Error(
      error instanceof Error ? error.message : "글 작성 중 오류가 발생했습니다"
    );
  }
}

/**
 * @deprecated Use useUpdateArticle hook with apiClient instead
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
    return result;
  } catch (error) {
    console.error("Error updating article draft:", error);
    throw new Error(
      error instanceof Error ? error.message : "글 수정 중 오류가 발생했습니다"
    );
  }
}

/**
 * @deprecated Use useListArticles hook with apiClient instead
 * List articles with optional filtering and pagination
 */
export async function listArticles(query?: Partial<ListArticlesQuery>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Build query string
    const params = new URLSearchParams();
    if (query?.limit !== undefined) params.append("limit", String(query.limit));
    if (query?.offset !== undefined) params.append("offset", String(query.offset));
    if (query?.status) params.append("status", query.status);
    if (query?.sortBy) params.append("sortBy", query.sortBy);
    if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/articles${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-clerk-user-id": userId,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to list articles:", errorData);
      throw new Error(
        errorData.error?.message || "글 목록을 불러오는데 실패했습니다"
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error listing articles:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "글 목록을 불러오는 중 오류가 발생했습니다"
    );
  }
}

/**
 * @deprecated Use useArticle hook with apiClient instead
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
    return result;
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
 * @deprecated Use useDashboardStats hook with apiClient instead
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(`${API_BASE_URL}/api/articles/stats`, {
      method: "GET",
      headers: {
        "x-clerk-user-id": userId,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to get dashboard stats:", errorData);
      throw new Error(
        errorData.error?.message || "대시보드 통계를 불러오는데 실패했습니다"
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "대시보드 통계를 불러오는 중 오류가 발생했습니다"
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


    // Handle 404 - return null if not found
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to get style guide:", errorData);
      throw new Error(
        errorData.error?.message || "스타일 가이드를 불러오는데 실패했습니다"
      );
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Error getting style guide:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "스타일 가이드를 불러오는 중 오류가 발생했습니다"
    );
  }
}


/**
 * Update a style guide
 */
export async function updateStyleGuideAction(
  guideId: string,
  data: Record<string, any>
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/style-guides/${guideId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": userId,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to update style guide:", errorData);
      throw new Error(
        errorData.error?.message || "스타일 가이드 업데이트에 실패했습니다"
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating style guide:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "스타일 가이드 업데이트 중 오류가 발생했습니다"
    );
  }
}

/**
 * Delete a style guide
 */
export async function deleteStyleGuideAction(guideId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/style-guides/${guideId}`,
      {
        method: "DELETE",
        headers: {
          "x-clerk-user-id": userId,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to delete style guide:", errorData);
      throw new Error(
        errorData.error?.message || "스타일 가이드 삭제에 실패했습니다"
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting style guide:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "스타일 가이드 삭제 중 오류가 발생했습니다"
    );
  }
}
