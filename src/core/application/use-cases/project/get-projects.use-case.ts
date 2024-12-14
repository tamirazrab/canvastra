import { Project } from "@/core/domain/entities";
import { ProjectRepository } from "@/core/domain/repositories";

export interface GetProjectsRequest {
  userId: string;
  page: number;
  limit: number;
}

export interface GetProjectsResponse {
  projects: Project[];
  nextPage: number | null;
}

export interface IGetProjectsUseCase {
  execute(request: GetProjectsRequest): Promise<GetProjectsResponse>;
}

export class GetProjectsUseCase implements IGetProjectsUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(request: GetProjectsRequest): Promise<GetProjectsResponse> {
    const { userId, page, limit } = request;

    const projects = await this.projectRepository.findByUserId(
      userId,
      page,
      limit
    );

    const nextPage = projects.length === limit ? page + 1 : null;

    return { projects, nextPage };
  }
}

