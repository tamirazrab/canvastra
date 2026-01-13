import { Context, Next } from "hono";
import { logger } from "@/lib/logger";

/**
 * Simple in-memory rate limiting middleware
 *
 * For production, consider using @upstash/ratelimit for distributed rate limiting.
 * This implementation is suitable for single-instance deployments.
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetAt < now) {
        delete store[key];
      }
    });
  },
  5 * 60 * 1000,
);

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  keyGenerator?: (c: Context) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

/**
 * Rate limiting middleware for Hono
 *
 * @param options - Rate limiting configuration
 * @returns Hono middleware function
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    keyGenerator = (c) => {
      // Default: rate limit by IP address
      const forwarded = c.req.header("x-forwarded-for");
      const ip = forwarded
        ? forwarded.split(",")[0].trim()
        : c.req.header("x-real-ip") || "unknown";
      return `rate-limit:${ip}`;
    },
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (c: Context, next: Next): Promise<Response | void> => {
    const key = keyGenerator(c);
    const now = Date.now();

    // Get or create rate limit entry
    let entry = store[key];

    if (!entry || entry.resetAt < now) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetAt: now + windowMs,
      };
      store[key] = entry;
    }

    // Check if limit exceeded
    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      logger.warn("Rate limit exceeded", {
        key,
        path: c.req.path,
        method: c.req.method,
        count: entry.count,
        max,
        retryAfter,
      });

      return c.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests, please try again later",
            retryAfter,
          },
        },
        429,
      );
    }

    // Increment counter
    entry.count++;

    // Set rate limit headers
    c.res.headers.set("X-RateLimit-Limit", String(max));
    c.res.headers.set(
      "X-RateLimit-Remaining",
      String(Math.max(0, max - entry.count)),
    );
    c.res.headers.set(
      "X-RateLimit-Reset",
      String(Math.ceil(entry.resetAt / 1000)),
    );

    try {
      await next();

      // Decrement on successful request if configured
      if (skipSuccessfulRequests && c.res.status < 400) {
        entry.count = Math.max(0, entry.count - 1);
      }

      // Decrement on failed request if configured
      if (skipFailedRequests && c.res.status >= 400) {
        entry.count = Math.max(0, entry.count - 1);
      }
    } catch (error) {
      // Decrement on error if configured
      if (skipFailedRequests) {
        entry.count = Math.max(0, entry.count - 1);
      }
      throw error;
    }
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Strict rate limiter for authentication endpoints
   * 5 requests per 15 minutes
   */
  auth: () =>
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      keyGenerator: (c) => {
        // Rate limit by IP for auth endpoints
        const forwarded = c.req.header("x-forwarded-for");
        const ip = forwarded
          ? forwarded.split(",")[0].trim()
          : c.req.header("x-real-ip") || "unknown";
        return `rate-limit:auth:${ip}`;
      },
    }),

  /**
   * Standard API rate limiter
   * 100 requests per minute
   */
  api: () =>
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100,
    }),

  /**
   * Strict rate limiter for expensive operations (AI, image processing)
   * 10 requests per minute
   */
  expensive: () =>
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10,
    }),
};
