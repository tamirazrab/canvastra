/**
 * Error message matchers for E2E tests.
 * 
 * Provides utilities to match error messages and failure types.
 */

export interface ErrorMatcher {
  pattern: RegExp | string;
  caseSensitive?: boolean;
}

/**
 * Create an error matcher from a pattern.
 */
export function createErrorMatcher(
  pattern: string | RegExp,
  caseSensitive = false,
): ErrorMatcher {
  return {
    pattern: typeof pattern === "string" ? new RegExp(pattern, caseSensitive ? "" : "i") : pattern,
    caseSensitive,
  };
}

/**
 * Match an error message against a pattern.
 */
export function matchError(message: string, matcher: ErrorMatcher): boolean {
  const regex =
    typeof matcher.pattern === "string"
      ? new RegExp(matcher.pattern, matcher.caseSensitive ? "" : "i")
      : matcher.pattern;

  return regex.test(message);
}

/**
 * Match an error message against multiple patterns (OR logic).
 */
export function matchAnyError(message: string, matchers: ErrorMatcher[]): boolean {
  return matchers.some((matcher) => matchError(message, matcher));
}

/**
 * Match an error message against all patterns (AND logic).
 */
export function matchAllErrors(message: string, matchers: ErrorMatcher[]): boolean {
  return matchers.every((matcher) => matchError(message, matcher));
}

/**
 * Extract error message from various error formats.
 */
export function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;

    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }

    if (typeof errorObj.error === "string") {
      return errorObj.error;
    }

    if (typeof errorObj.error === "object" && errorObj.error !== null) {
      const nestedError = errorObj.error as Record<string, unknown>;
      if (typeof nestedError.message === "string") {
        return nestedError.message;
      }
    }
  }

  return String(error);
}

/**
 * Common error message patterns.
 */
export const ErrorPatterns = {
  notFound: /not found|notFound|not_found|404/i,
  unauthorized: /unauthorized|authentication required|401/i,
  forbidden: /forbidden|not authorized|403/i,
  validation: /validation|invalid|bad request|400/i,
  network: /network|connection|timeout|500/i,
  serverError: /server error|internal error|500/i,
  projectNotFound: /project.*not found|projectNotFound/i,
  projectUnauthorized: /project.*unauthorized|project.*forbidden/i,
  subscriptionNotFound: /subscription.*not found|subscriptionNotFound/i,
  paymentFailed: /payment.*failed|payment.*error/i,
} as const;

/**
 * Match common error patterns.
 */
export function matchCommonError(message: string, pattern: keyof typeof ErrorPatterns): boolean {
  return ErrorPatterns[pattern].test(message);
}

/**
 * Assert that an error matches a pattern.
 */
export function assertErrorMatches(
  error: unknown,
  pattern: ErrorMatcher | keyof typeof ErrorPatterns,
): void {
  const message = extractErrorMessage(error);

  if (typeof pattern === "string") {
    if (!matchCommonError(message, pattern)) {
      throw new Error(`Expected error to match pattern "${pattern}" but got: ${message}`);
    }
  } else {
    if (!matchError(message, pattern)) {
      throw new Error(`Expected error to match pattern ${pattern.pattern} but got: ${message}`);
    }
  }
}

/**
 * Assert that an error matches any of the given patterns.
 */
export function assertErrorMatchesAny(
  error: unknown,
  patterns: Array<ErrorMatcher | keyof typeof ErrorPatterns>,
): void {
  const message = extractErrorMessage(error);

  const matched = patterns.some((pattern) => {
    if (typeof pattern === "string") {
      return matchCommonError(message, pattern);
    } else {
      return matchError(message, pattern);
    }
  });

  if (!matched) {
    throw new Error(
      `Expected error to match one of the patterns but got: ${message}`,
    );
  }
}

