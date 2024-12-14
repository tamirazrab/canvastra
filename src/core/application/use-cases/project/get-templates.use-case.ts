import { Project } from "@/core/domain/entities";
import { ProjectRepository } from "@/core/domain/repositories";

export interface GetTemplatesRequest {
  page: number;
  limit: number;
}

export interface GetTemplatesResponse {
  templates: Project[];
}

export interface IGetTemplatesUseCase {
  execute(request: GetTemplatesRequest): Promise<GetTemplatesResponse>;
}

export class GetTemplatesUseCase implements IGetTemplatesUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(request: GetTemplatesRequest): Promise<GetTemplatesResponse> {
    const { page, limit } = request;

    const templates = await this.projectRepository.findTemplates(page, limit);

    return { templates };
  }
}

