import { ProjectRepository } from "@/core/domain/repositories";
import { EntityNotFoundException, UnauthorizedException } from "@/core/domain/exceptions";

export interface DeleteProjectRequest {
  projectId: string;
  userId: string;
}

export interface DeleteProjectResponse {
  success: boolean;
}

export interface IDeleteProjectUseCase {
  execute(request: DeleteProjectRequest): Promise<DeleteProjectResponse>;
}

export class DeleteProjectUseCase implements IDeleteProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(
    request: DeleteProjectRequest
  ): Promise<DeleteProjectResponse> {
    const { projectId, userId } = request;

    // Verify ownership
    const project = await this.projectRepository.findByUserIdAndId(
      userId,
      projectId
    );
    if (!project) {
      throw new EntityNotFoundException("Project", projectId);
    }
    if (!project.belongsTo(userId)) {
      throw new UnauthorizedException("You do not have access to this project");
    }

    await this.projectRepository.delete(projectId, userId);

    return { success: true };
  }
}

