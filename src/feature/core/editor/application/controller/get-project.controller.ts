import { ApiEither } from "@/feature/common/data/api-task";
import getProjectUseCase from "@/feature/core/project/domain/usecase/get-project.usecase";
import Project from "@/feature/core/project/domain/entity/project.entity";

/**
 * Controller for getting a project by ID.
 * Called from Hono routes (not Server Actions).
 */
export default async function getProjectController(
  id: string,
  userId: string,
): Promise<ApiEither<Project>> {
  return getProjectUseCase(id, userId);
}

