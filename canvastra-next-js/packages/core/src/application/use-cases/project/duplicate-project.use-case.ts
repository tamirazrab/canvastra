import type { Project } from "../../domain/entities";
import type { ProjectRepository } from "../../domain/repositories";

export interface DuplicateProjectRequest {
	id: string;
	userId: string;
}

export interface DuplicateProjectResponse {
	project: Project;
}

export interface IDuplicateProjectUseCase {
	execute(request: DuplicateProjectRequest): Promise<DuplicateProjectResponse>;
}

export class DuplicateProjectUseCase implements IDuplicateProjectUseCase {
	constructor(private readonly projectRepository: ProjectRepository) {}

	async execute(
		request: DuplicateProjectRequest,
	): Promise<DuplicateProjectResponse> {
		const { id, userId } = request;

		const existingProject = await this.projectRepository.findByUserIdAndId(
			userId,
			id,
		);

		if (!existingProject) {
			throw new Error("Project not found");
		}

		const project = await this.projectRepository.create({
			name: `Copy of ${existingProject.name}`,
			userId,
			json: existingProject.json,
			width: existingProject.width,
			height: existingProject.height,
			isTemplate: false,
			isPro: false,
		});

		return { project };
	}
}
