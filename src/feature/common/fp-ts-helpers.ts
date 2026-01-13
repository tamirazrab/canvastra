import { Either, left, right } from "fp-ts/lib/Either";
import { TaskEither, tryCatch, chain } from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import ApiTask from "@/feature/common/data/api-task";
import BaseFailure from "@/feature/common/failures/base.failure";
import { failureOr } from "@/feature/common/failures/failure-helpers";
import NetworkFailure from "@/feature/common/failures/network.failure";

/**
 * Wraps an async operation in TaskEither with error handling
 * 
 * Converts a Promise to TaskEither, handling errors with failureOr pattern
 */
export function wrapAsync<T>(
  operation: () => Promise<T>,
  errorFactory: (error: unknown) => BaseFailure<unknown> = (error) =>
    new NetworkFailure(error as Error),
): TaskEither<BaseFailure<unknown>, T> {
  return tryCatch(operation, (error) => failureOr(error, errorFactory(error)));
}

/**
 * Converts null/undefined to Either error
 * 
 * Wrapper around fp-ts fromNullable that works with BaseFailure
 */
export function fromNullable<E extends BaseFailure<unknown>>(
  onNone: () => E,
): <A>(ma: TaskEither<BaseFailure<unknown>, A | null>) => TaskEither<BaseFailure<unknown>, A> {
  return (ma) =>
    pipe(
      ma,
      chain((a) => (a === null || a === undefined ? left(onNone()) : right(a))),
    );
}

/**
 * Maps database result to entity, handling null case
 * 
 * Common pattern: tryCatch -> fromNullable -> map to entity
 */
export function mapToEntity<TDb, TEntity>(
  mapper: (db: TDb) => TEntity,
  notFoundError: () => BaseFailure<unknown>,
) {
  return (result: TaskEither<BaseFailure<unknown>, TDb | null>): TaskEither<BaseFailure<unknown>, TEntity> => {
    return pipe(
      result,
      fromNullable(notFoundError),
      chain((db) => right(mapper(db))),
    );
  };
}

/**
 * Handles repository result that may be null
 * 
 * Converts null result to error, otherwise maps to entity
 */
export function handleRepositoryResult<TDb, TEntity>(
  result: TaskEither<BaseFailure<unknown>, TDb | null>,
  mapper: (db: TDb) => TEntity,
  notFoundError: () => BaseFailure<unknown>,
): TaskEither<BaseFailure<unknown>, TEntity> {
  return pipe(
    result,
    fromNullable(notFoundError),
    chain((db) => right(mapper(db))),
  );
}

/**
 * Extracts error message from Either for logging/display
 */
export function foldError<T>(either: Either<BaseFailure<unknown>, T>): string | null {
  return either._tag === "Left" ? either.left.message : null;
}

/**
 * Extracts success value from Either, or returns null
 */
export function foldSuccess<T>(either: Either<BaseFailure<unknown>, T>): T | null {
  return either._tag === "Right" ? either.right : null;
}

/**
 * Checks if Either is Left (error)
 */
export function isLeft<T>(either: Either<BaseFailure<unknown>, T>): either is Either<BaseFailure<unknown>, never> {
  return either._tag === "Left";
}

/**
 * Checks if Either is Right (success)
 */
export function isRight<T>(either: Either<BaseFailure<unknown>, T>): either is Either<never, T> {
  return either._tag === "Right";
}

