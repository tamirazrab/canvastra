import { Project } from "@/core/domain/entities";
import { ProjectRepository } from "@/core/domain/repositories";
import { EntityNotFoundException, UnauthorizedException } from "@/core/domain/exceptions";

export interface GetProjectRequest {
  projectId: string;
  userId: string;
}

export interface GetProjectResponse {
  project: Project;
}

export interface IGetProjectUseCase {
  execute(request: GetProjectRequest): Promise<GetProjectResponse>;
}

export class GetProjectUseCase implements IGetProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(request: GetProjectRequest): Promise<GetProjectResponse> {
    const { projectId, userId } = request;

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

    return { project };
  }
}

