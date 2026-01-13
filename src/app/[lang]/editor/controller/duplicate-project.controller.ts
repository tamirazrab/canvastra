import { ApiEither } from "@/feature/common/data/api-task";
import duplicateProjectUseCase from "@/feature/core/project/domain/usecase/duplicate-project.usecase";
import Project from "@/feature/core/project/domain/entity/project.entity";

/**
 * Controller for duplicating a project.
 * Called from Hono routes (not Server Actions).
 */
export default async function duplicateProjectController(
  id: string,
  userId: string,
): Promise<ApiEither<Project>> {
  return duplicateProjectUseCase(id, userId);
}
