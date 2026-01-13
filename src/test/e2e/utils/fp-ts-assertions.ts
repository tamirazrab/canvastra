import { Either } from "fp-ts/lib/Either";
import { isLeft, isRight } from "@/feature/common/fp-ts-helpers";
import type { BaseFailure } from "@/feature/common/failures/base.failure";

/**
 * fp-ts assertion utilities for E2E tests.
 * 
 * Provides assertions for Either/TaskEither results from domain layer.
 * Tests observable behavior, not fp-ts internals.
 */

export interface FailureAssertion {
  namespace?: string;
  messagePattern?: string | RegExp;
  statusCode?: number;
}

/**
 * Assert that an API response represents a failure (Left).
 * Checks the HTTP status code and error message structure.
 */
export function assertFailureResponse(
  status: number,
  body: unknown,
  expectedFailure?: FailureAssertion,
): void {
  if (status < 400) {
    throw new Error(`Expected failure response but got status ${status}`);
  }

  if (typeof body !== "object" || body === null) {
    throw new Error(`Expected error object but got: ${JSON.stringify(body)}`);
  }

  const errorBody = body as { error?: string | { message?: string; namespace?: string } };

  if (expectedFailure) {
    if (expectedFailure.statusCode && status !== expectedFailure.statusCode) {
      throw new Error(
        `Expected status ${expectedFailure.statusCode} but got ${status}`,
      );
    }

    const errorMessage =
      typeof errorBody.error === "string"
        ? errorBody.error
        : errorBody.error?.message || "";

    if (expectedFailure.messagePattern) {
      const pattern =
        typeof expectedFailure.messagePattern === "string"
          ? new RegExp(expectedFailure.messagePattern, "i")
          : expectedFailure.messagePattern;

      if (!pattern.test(errorMessage)) {
        throw new Error(
          `Expected error message to match ${pattern} but got: ${errorMessage}`,
        );
      }
    }

    if (expectedFailure.namespace) {
      const errorObj = typeof errorBody.error === "object" ? errorBody.error : null;
      if (errorObj?.namespace !== expectedFailure.namespace) {
        throw new Error(
          `Expected namespace ${expectedFailure.namespace} but got: ${errorObj?.namespace || "none"}`,
        );
      }
    }
  }
}

/**
 * Assert that an API response represents a success (Right).
 * Checks the HTTP status code and data structure.
 */
export function assertSuccessResponse<T>(
  status: number,
  body: unknown,
  dataValidator?: (data: unknown) => data is T,
): T {
  if (status < 200 || status >= 300) {
    throw new Error(`Expected success response but got status ${status}`);
  }

  if (typeof body !== "object" || body === null) {
    throw new Error(`Expected response object but got: ${JSON.stringify(body)}`);
  }

  const responseBody = body as { data?: unknown; error?: unknown };

  if (responseBody.error) {
    throw new Error(`Response contains error: ${JSON.stringify(responseBody.error)}`);
  }

  if (!("data" in responseBody)) {
    throw new Error(`Response missing data field: ${JSON.stringify(body)}`);
  }

  if (dataValidator && !dataValidator(responseBody.data)) {
    throw new Error(`Data validation failed: ${JSON.stringify(responseBody.data)}`);
  }

  return responseBody.data as T;
}

/**
 * Assert that an Either is Left (failure).
 * Extracts and validates the failure.
 */
export function assertEitherLeft<T>(
  either: Either<BaseFailure<unknown>, T>,
  expectedFailure?: FailureAssertion,
): BaseFailure<unknown> {
  if (!isLeft(either)) {
    throw new Error("Expected Either to be Left (failure) but got Right (success)");
  }

  const failure = either.left;

  if (expectedFailure) {
    if (expectedFailure.namespace && failure.namespace !== expectedFailure.namespace) {
      throw new Error(
        `Expected namespace ${expectedFailure.namespace} but got ${failure.namespace}`,
      );
    }

    if (expectedFailure.messagePattern) {
      const pattern =
        typeof expectedFailure.messagePattern === "string"
          ? new RegExp(expectedFailure.messagePattern, "i")
          : expectedFailure.messagePattern;

      if (!pattern.test(failure.message)) {
        throw new Error(
          `Expected message to match ${pattern} but got: ${failure.message}`,
        );
      }
    }
  }

  return failure;
}

/**
 * Assert that an Either is Right (success).
 * Extracts and returns the success value.
 */
export function assertEitherRight<T>(
  either: Either<BaseFailure<unknown>, T>,
  valueValidator?: (value: T) => boolean,
): T {
  if (!isRight(either)) {
    throw new Error("Expected Either to be Right (success) but got Left (failure)");
  }

  const value = either.right;

  if (valueValidator && !valueValidator(value)) {
    throw new Error(`Value validation failed: ${JSON.stringify(value)}`);
  }

  return value;
}

/**
 * Assert HTTP status code matches expected failure type.
 */
export function assertFailureStatusCode(
  status: number,
  expectedStatus: number,
  failureType?: string,
): void {
  if (status !== expectedStatus) {
    throw new Error(
      `Expected ${failureType || "failure"} status ${expectedStatus} but got ${status}`,
    );
  }
}

/**
 * Common failure assertions for domain failures.
 */
export const FailureAssertions = {
  projectNotFound: (): FailureAssertion => ({
    namespace: "project",
    messagePattern: /not found|notFound|not_found/i,
    statusCode: 404,
  }),

  projectUnauthorized: (): FailureAssertion => ({
    namespace: "project",
    messagePattern: /unauthorized|forbidden|not authorized/i,
    statusCode: 403,
  }),

  validationError: (): FailureAssertion => ({
    namespace: "params",
    messagePattern: /validation|invalid/i,
    statusCode: 400,
  }),

  networkError: (): FailureAssertion => ({
    namespace: "network",
    messagePattern: /network|connection|timeout/i,
    statusCode: 500,
  }),

  unauthorized: (): FailureAssertion => ({
    statusCode: 401,
    messagePattern: /unauthorized|authentication/i,
  }),

  forbidden: (): FailureAssertion => ({
    statusCode: 403,
    messagePattern: /forbidden|not authorized/i,
  }),

  notFound: (): FailureAssertion => ({
    statusCode: 404,
    messagePattern: /not found/i,
  }),
} as const;

