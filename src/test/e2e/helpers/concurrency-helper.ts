import { APIRequestContext } from "@playwright/test";

/**
 * Concurrency helper utilities for E2E tests.
 * Provides functions to test concurrent requests and race conditions.
 */

export interface ConcurrentRequestOptions {
  url: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  data?: unknown;
  count?: number;
}

export interface ConcurrentRequestResult {
  status: number;
  body: unknown;
  headers: Record<string, string>;
  index: number;
  duration: number;
}

/**
 * Make multiple concurrent requests to the same endpoint.
 * Useful for testing race conditions and concurrent updates.
 */
export async function makeConcurrentRequests(
  request: APIRequestContext,
  options: ConcurrentRequestOptions,
): Promise<ConcurrentRequestResult[]> {
  const count = options.count || 5;
  const method = options.method || "GET";

  const startTime = Date.now();
  const promises = Array.from({ length: count }, async (_, index) => {
    const requestStartTime = Date.now();
    try {
      const response = await request[method.toLowerCase()](options.url, {
        headers: options.headers,
        data: options.data,
      });

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

      const duration = Date.now() - requestStartTime;

      return {
        status: response.status(),
        body,
        headers: response.headers(),
        index,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - requestStartTime;
      return {
        status: 0,
        body: { error: error instanceof Error ? error.message : String(error) },
        headers: {},
        index,
        duration,
      };
    }
  });

  const results = await Promise.all(promises);
  const totalDuration = Date.now() - startTime;

  console.log(
    `Made ${count} concurrent ${method} requests to ${options.url} in ${totalDuration}ms`,
  );

  return results;
}

/**
 * Make concurrent requests with different data.
 * Useful for testing concurrent updates with different values.
 */
export async function makeConcurrentRequestsWithData<T>(
  request: APIRequestContext,
  baseUrl: string,
  dataArray: T[],
  options: {
    method?: "POST" | "PATCH" | "PUT";
    headers?: Record<string, string>;
  } = {},
): Promise<ConcurrentRequestResult[]> {
  const method = options.method || "POST";

  const promises = dataArray.map(async (data, index) => {
    const requestStartTime = Date.now();
    try {
      const response = await request[method.toLowerCase()](baseUrl, {
        headers: options.headers,
        data: data as unknown,
      });

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

      const duration = Date.now() - requestStartTime;

      return {
        status: response.status(),
        body,
        headers: response.headers(),
        index,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - requestStartTime;
      return {
        status: 0,
        body: { error: error instanceof Error ? error.message : String(error) },
        headers: {},
        index,
        duration,
      };
    }
  });

  return Promise.all(promises);
}

/**
 * Wait for all concurrent requests to complete and analyze results.
 */
export async function waitForConcurrentRequests(
  promises: Promise<ConcurrentRequestResult>[],
): Promise<{
  results: ConcurrentRequestResult[];
  successCount: number;
  failureCount: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
}> {
  const results = await Promise.all(promises);

  const successCount = results.filter((r) => r.status >= 200 && r.status < 300).length;
  const failureCount = results.length - successCount;
  const durations = results.map((r) => r.duration);
  const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  return {
    results,
    successCount,
    failureCount,
    averageDuration,
    minDuration,
    maxDuration,
  };
}

/**
 * Test race condition by making concurrent updates to the same resource.
 */
export async function testRaceCondition(
  request: APIRequestContext,
  url: string,
  updateData: unknown[],
  options: {
    method?: "PATCH" | "PUT";
    headers?: Record<string, string>;
  } = {},
): Promise<{
  results: ConcurrentRequestResult[];
  finalState: unknown;
  conflicts: number;
}> {
  const method = options.method || "PATCH";

  // Make concurrent updates
  const results = await makeConcurrentRequestsWithData(request, url, updateData, {
    method,
    headers: options.headers,
  });

  // Get final state
  const finalResponse = await request.get(url, { headers: options.headers });
  const finalState = await finalResponse.json().catch(() => null);

  // Count conflicts (non-200 responses)
  const conflicts = results.filter((r) => r.status !== 200).length;

  return {
    results,
    finalState,
    conflicts,
  };
}

