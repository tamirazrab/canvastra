import { Page, APIRequestContext } from "@playwright/test";
import { getAuthCookies } from "./auth-helper";
import { createTestUser } from "./db-helper";
import { authenticateUser } from "./auth-helper";
import { testEnvConfig } from "../config/test-env.config";

/**
 * API request helper utilities for E2E tests.
 * Provides functions to make authenticated API requests.
 */

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string | number>;
  timeout?: number;
}

/**
 * Get authentication cookies as a cookie header string.
 * Useful for API requests that need authentication.
 */
export async function getAuthCookieHeader(page: Page): Promise<string> {
  const cookies = await getAuthCookies(page);
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

/**
 * Get authentication headers for API requests.
 */
export async function getAuthHeaders(page: Page): Promise<Record<string, string>> {
  const cookieHeader = await getAuthCookieHeader(page);
  return {
    Cookie: cookieHeader,
    "Content-Type": "application/json",
  };
}

/**
 * Make an authenticated API request.
 * Uses cookies from the page context for authentication.
 */
export async function authenticatedApiRequest(
  request: APIRequestContext,
  page: Page,
  url: string,
  options: ApiRequestOptions = {},
): Promise<{ status: number; body: unknown; headers: Record<string, string> }> {
  const authHeaders = await getAuthHeaders(page);
  const fullUrl = url.startsWith("http") ? url : `${testEnvConfig.app.baseUrl}${url}`;

  const requestOptions: {
    headers: Record<string, string>;
    data?: unknown;
    params?: Record<string, string>;
    timeout?: number;
  } = {
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  };

  if (options.data) {
    requestOptions.data = options.data;
  }

  if (options.params) {
    requestOptions.params = Object.fromEntries(
      Object.entries(options.params).map(([key, value]) => [key, String(value)]),
    );
  }

  if (options.timeout) {
    requestOptions.timeout = options.timeout;
  }

  const method = options.method || "GET";
  const response = await request[method.toLowerCase()](fullUrl, requestOptions);

  let body: unknown;
  try {
    const contentType = response.headers()["content-type"] || "";
    if (contentType.includes("application/json")) {
      body = await response.json();
    } else {
      body = await response.text();
    }
  } catch {
    body = null;
  }

  return {
    status: response.status(),
    body,
    headers: response.headers(),
  };
}

/**
 * Make an unauthenticated API request.
 * Useful for testing authentication requirements.
 */
export async function unauthenticatedApiRequest(
  request: APIRequestContext,
  url: string,
  options: ApiRequestOptions = {},
): Promise<{ status: number; body: unknown; headers: Record<string, string> }> {
  const fullUrl = url.startsWith("http") ? url : `${testEnvConfig.app.baseUrl}${url}`;

  const requestOptions: {
    headers?: Record<string, string>;
    data?: unknown;
    params?: Record<string, string>;
    timeout?: number;
  } = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (options.data) {
    requestOptions.data = options.data;
  }

  if (options.params) {
    requestOptions.params = Object.fromEntries(
      Object.entries(options.params).map(([key, value]) => [key, String(value)]),
    );
  }

  if (options.timeout) {
    requestOptions.timeout = options.timeout;
  }

  const method = options.method || "GET";
  const response = await request[method.toLowerCase()](fullUrl, requestOptions);

  let body: unknown;
  try {
    const contentType = response.headers()["content-type"] || "";
    if (contentType.includes("application/json")) {
      body = await response.json();
    } else {
      body = await response.text();
    }
  } catch {
    body = null;
  }

  return {
    status: response.status(),
    body,
    headers: response.headers(),
  };
}

/**
 * Create an authenticated API request context.
 * Creates a user, authenticates them, and returns a function to make authenticated requests.
 */
export async function createAuthenticatedApiContext(
  page: Page,
  userOverrides?: { email?: string; name?: string; password?: string },
): Promise<{
  user: { id: string; email: string; name: string; password: string };
  request: (
    url: string,
    options?: ApiRequestOptions,
  ) => Promise<{ status: number; body: unknown; headers: Record<string, string> }>;
}> {
  const user = await createTestUser(userOverrides);
  await authenticateUser(page, user.email, user.password);

  return {
    user,
    request: async (url: string, options?: ApiRequestOptions) => {
      // Get APIRequestContext from page
      const request = page.request;
      return authenticatedApiRequest(request, page, url, options);
    },
  };
}

/**
 * Get auth cookies for a user (without page context).
 * Useful for API requests that don't have a page.
 */
export async function getAuthCookiesForUser(
  page: Page,
  user: { email: string; password: string },
): Promise<string> {
  await authenticateUser(page, user.email, user.password);
  return await getAuthCookieHeader(page);
}

