import { Page, APIRequestContext } from "@playwright/test";

/**
 * Performance helper utilities for E2E tests.
 * Provides functions to measure and assert performance metrics.
 */

export interface PerformanceMetrics {
  duration: number;
  startTime: number;
  endTime: number;
  memoryUsage?: NodeJS.MemoryUsage;
}

export interface PerformanceThreshold {
  maxDuration: number;
  minDuration?: number;
  description?: string;
}

/**
 * Measure the duration of an async operation.
 */
export async function measurePerformance<T>(
  operation: () => Promise<T>,
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  const result = await operation();

  const endTime = Date.now();
  const endMemory = process.memoryUsage();
  const duration = endTime - startTime;

  return {
    result,
    metrics: {
      duration,
      startTime,
      endTime,
      memoryUsage: {
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        external: endMemory.external - startMemory.external,
        rss: endMemory.rss - startMemory.rss,
      },
    },
  };
}

/**
 * Measure page load performance.
 */
export async function measurePageLoad(
  page: Page,
  url: string,
): Promise<PerformanceMetrics> {
  const startTime = Date.now();

  const response = await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForLoadState("domcontentloaded");

  const endTime = Date.now();
  const duration = endTime - startTime;

  return {
    duration,
    startTime,
    endTime,
  };
}

/**
 * Measure API request performance.
 */
export async function measureApiRequest(
  request: APIRequestContext,
  url: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    headers?: Record<string, string>;
    data?: unknown;
  } = {},
): Promise<{ response: unknown; metrics: PerformanceMetrics }> {
  const startTime = Date.now();
  const method = options.method || "GET";

  const response = await request[method.toLowerCase()](url, {
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

  const endTime = Date.now();
  const duration = endTime - startTime;

  return {
    response: body,
    metrics: {
      duration,
      startTime,
      endTime,
    },
  };
}

/**
 * Assert that performance meets threshold.
 */
export function assertPerformanceThreshold(
  metrics: PerformanceMetrics,
  threshold: PerformanceThreshold,
): void {
  if (metrics.duration > threshold.maxDuration) {
    throw new Error(
      `Performance threshold exceeded: ${metrics.duration}ms > ${threshold.maxDuration}ms` +
      (threshold.description ? ` (${threshold.description})` : ""),
    );
  }

  if (threshold.minDuration && metrics.duration < threshold.minDuration) {
    throw new Error(
      `Performance below minimum threshold: ${metrics.duration}ms < ${threshold.minDuration}ms` +
      (threshold.description ? ` (${threshold.description})` : ""),
    );
  }
}

/**
 * Measure multiple operations and get statistics.
 */
export async function measureMultipleOperations<T>(
  operations: Array<() => Promise<T>>,
): Promise<{
  results: T[];
  metrics: PerformanceMetrics[];
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  totalDuration: number;
}> {
  const results: T[] = [];
  const metrics: PerformanceMetrics[] = [];

  for (const operation of operations) {
    const { result, metrics: operationMetrics } = await measurePerformance(operation);
    results.push(result);
    metrics.push(operationMetrics);
  }

  const durations = metrics.map((m) => m.duration);
  const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const totalDuration = durations.reduce((a, b) => a + b, 0);

  return {
    results,
    metrics,
    averageDuration,
    minDuration,
    maxDuration,
    totalDuration,
  };
}

/**
 * Track performance over time (useful for detecting memory leaks).
 */
export class PerformanceTracker {
  private measurements: PerformanceMetrics[] = [];

  /**
   * Record a performance measurement.
   */
  record(metrics: PerformanceMetrics): void {
    this.measurements.push(metrics);
  }

  /**
   * Get all measurements.
   */
  getMeasurements(): PerformanceMetrics[] {
    return this.measurements;
  }

  /**
   * Get average duration.
   */
  getAverageDuration(): number {
    if (this.measurements.length === 0) {
      return 0;
    }
    const total = this.measurements.reduce((sum, m) => sum + m.duration, 0);
    return total / this.measurements.length;
  }

  /**
   * Get trend (increasing, decreasing, stable).
   */
  getTrend(): "increasing" | "decreasing" | "stable" {
    if (this.measurements.length < 2) {
      return "stable";
    }

    const durations = this.measurements.map((m) => m.duration);
    const firstHalf = durations.slice(0, Math.floor(durations.length / 2));
    const secondHalf = durations.slice(Math.floor(durations.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    const threshold = firstAvg * 0.1; // 10% change threshold

    if (diff > threshold) {
      return "increasing";
    } else if (diff < -threshold) {
      return "decreasing";
    } else {
      return "stable";
    }
  }

  /**
   * Reset all measurements.
   */
  reset(): void {
    this.measurements = [];
  }
}

