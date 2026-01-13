import { ApiEither } from "@/feature/common/data/api-task";
import deleteProjectUseCase from "@/feature/core/project/domain/usecase/delete-project.usecase";

/**
 * Controller for deleting a project.
 * Called from Hono routes (not Server Actions).
 */
export default async function deleteProjectController(
  id: string,
  userId: string,
): Promise<ApiEither<true>> {
  return deleteProjectUseCase(id, userId);
}

