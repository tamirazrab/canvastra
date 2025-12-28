import type { Project } from "../../domain/entities";
import type { ProjectRepository } from "../../domain/repositories";

export interface ListTemplatesRequest {
	page: number;
	limit: number;
}

export interface ListTemplatesResponse {
	projects: Project[];
}

export interface IListTemplatesUseCase {
	execute(request: ListTemplatesRequest): Promise<ListTemplatesResponse>;
}

export class ListTemplatesUseCase implements IListTemplatesUseCase {
	constructor(private readonly projectRepository: ProjectRepository) {}

	async execute(request: ListTemplatesRequest): Promise<ListTemplatesResponse> {
		const { page, limit } = request;

		const projects = await this.projectRepository.findTemplates(page, limit);

		return { projects };
	}
}
