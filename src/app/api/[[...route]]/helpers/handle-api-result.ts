import { Either } from "fp-ts/lib/Either";
import { Context } from "hono";
import BaseFailure from "@/feature/common/failures/base.failure";
import { failureToHttpStatus } from "./failure-to-status";

/**
 * Handles API result with explicit error/success paths
 * 
 * Uses fp-ts fold pattern for clear error handling
 */
export function handleApiResult<T>(
  result: Either<BaseFailure<unknown>, T>,
  c: Context,
): Response {
  if (result._tag === "Left") {
    const status = failureToHttpStatus(result.left);
    return c.json({ error: result.left.message }, status as 400 | 401 | 403 | 404 | 500);
  }

  return c.json({ data: result.right });
}

