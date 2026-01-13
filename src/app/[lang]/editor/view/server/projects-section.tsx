import { isLeft } from "fp-ts/lib/Either";
import getProjectsController from "@/feature/core/editor/application/controller/get-projects.controller";
import { getCurrentUserId } from "@/bootstrap/helpers/auth-utils";
import { logger } from "@/lib/logger";
import { ProjectsList } from "../client/projects-list";

export async function ProjectsSection() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Recent projects</h3>
        <div className="flex flex-col gap-y-4 items-center justify-center h-32">
          <p className="text-muted-foreground text-sm">
            Please sign in to view your projects
          </p>
        </div>
      </div>
    );
  }

  const result = await getProjectsController({
    userId,
    limit: 5,
    skip: 0,
  });

  if (isLeft(result)) {
    // Log error for monitoring and debugging
    logger.error("Failed to load projects", new Error(result.left.message), {
      namespace: result.left.namespace,
      userId,
      limit: 5,
      skip: 0,
    });

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Recent projects</h3>
        <div className="flex flex-col gap-y-4 items-center justify-center h-32">
          <p className="text-muted-foreground text-sm">
            Failed to load projects. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!result.right.items || result.right.items.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Recent projects</h3>
        <div className="flex flex-col gap-y-4 items-center justify-center h-32">
          <p className="text-muted-foreground text-sm">No projects found</p>
        </div>
      </div>
    );
  }

  return <ProjectsList initialProjects={result.right.items} />;
}
