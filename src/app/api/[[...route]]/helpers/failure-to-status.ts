/**
 * Maps domain failures to appropriate HTTP status codes
 *
 * This ensures consistent error handling across API routes.
 * Failures come from domain layer as plain objects (via toPlainObject()),
 * so we check by namespace and message patterns.
 *
 * @param failure - The failure object from domain layer (plain object)
 * @returns HTTP status code (400, 401, 403, 404, 500)
 */
export function failureToHttpStatus(failure: {
  namespace: string;
  message: string;
  metadata?: unknown;
}): number {
  // Check by namespace and message patterns
  if (failure.namespace === "project") {
    // Project-specific failures
    if (
      failure.message.includes("notFound") ||
      failure.message.includes("not_found") ||
      failure.message.includes("not found")
    ) {
      return 404;
    }
    if (
      failure.message.includes("unauthorized") ||
      failure.message.includes("forbidden") ||
      failure.message.includes("not authorized")
    ) {
      return 403; // Forbidden - user authenticated but not authorized for this resource
    }
  }

  // Check for validation/params failures
  if (
    failure.namespace === "params" ||
    failure.message.includes("validation") ||
    failure.message.includes("invalid")
  ) {
    return 400; // Bad Request - validation error
  }

  // Check for network failures (these are usually server errors)
  if (failure.namespace === "network") {
    return 500; // Internal Server Error
  }

  // Default to 400 for client errors
  // Most domain failures are client errors (validation, not found, etc.)
  return 400;
}
