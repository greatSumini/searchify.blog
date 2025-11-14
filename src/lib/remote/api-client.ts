import axios, { isAxiosError, type AxiosRequestConfig } from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  headers: {
    "Content-Type": "application/json",
  },
});

type ErrorPayload = {
  error?: {
    message?: string;
  };
  message?: string;
};

export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage = "API request failed."
) => {
  if (isAxiosError(error)) {
    const payload = error.response?.data as ErrorPayload | undefined;

    if (typeof payload?.error?.message === "string") {
      return payload.error.message;
    }

    if (typeof payload?.message === "string") {
      return payload.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

/**
 * Helper to create API client with Clerk authentication headers
 * Should be called from Client Components with useAuth hook
 */
export const createAuthenticatedClient = (userId: string | null | undefined) => {
  if (!userId) {
    return apiClient;
  }

  const authenticatedClient = axios.create({
    ...apiClient.defaults,
    headers: {
      ...apiClient.defaults.headers,
      "x-clerk-user-id": userId,
    },
  });

  return authenticatedClient;
};

export { apiClient, isAxiosError };
