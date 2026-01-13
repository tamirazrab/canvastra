/**
 * Input sanitization utilities
 *
 * Sanitizes user-generated content to prevent XSS attacks.
 * Zod validates types but doesn't sanitize content.
 */

/**
 * Sanitizes a string by removing potentially dangerous HTML/script tags
 *
 * For production, consider using DOMPurify or similar library.
 * This is a basic implementation for JSON string sanitization.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return input;
  }

  // Remove script tags and event handlers
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/data:text\/html/gi, ""); // Remove data URIs with HTML
}

/**
 * Recursively sanitizes an object, sanitizing all string values
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    return sanitizeString(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as T;
  }

  if (typeof obj === "object") {
    const sanitized = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitizes a JSON string that may contain user-generated content
 *
 * Parses the JSON, sanitizes all string values, and returns sanitized JSON string.
 * Returns original string if parsing fails (validation will catch it).
 */
export function sanitizeJson(jsonString: string): string {
  if (typeof jsonString !== "string") {
    return jsonString;
  }

  try {
    const parsed = JSON.parse(jsonString);
    const sanitized = sanitizeObject(parsed);
    return JSON.stringify(sanitized);
  } catch {
    // Invalid JSON - let validation catch it
    // Still sanitize the string itself
    return sanitizeString(jsonString);
  }
}

/**
 * Sanitizes project JSON data
 *
 * Specifically for project.json field which contains canvas data.
 * Ensures no XSS in text objects or other user-generated content.
 */
export function sanitizeProjectJson(jsonString: string): string {
  return sanitizeJson(jsonString);
}
