import { beforeEach, describe, expect, it, vi } from "vitest";
import { Project } from "../../../domain/entities";
import type { ProjectRepository } from "../../../domain/repositories";
import { DuplicateProjectUseCase } from "./duplicate-project.use-case";

describe("DuplicateProjectUseCase", () => {
	let mockRepository: ProjectRepository;
	let useCase: DuplicateProjectUseCase;

	beforeEach(() => {
		mockRepository = {
			findById: vi.fn(),
			findByUserId: vi.fn(),
			findByUserIdAndId: vi.fn(),
			save: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			findTemplates: vi.fn(),
		};

		useCase = new DuplicateProjectUseCase(mockRepository);
	});

	it("should duplicate a project successfully", async () => {
		const userId = "user-123";
		const projectId = "project-123";

		const existingProject = new Project({
			id: projectId,
			name: "Original Project",
			userId,
			json: '{"objects": []}',
			width: 1920,
			height: 1080,
		});

		const duplicatedProject = new Project({
			id: "project-456",
			name: "Copy of Original Project",
			userId,
			json: '{"objects": []}',
			width: 1920,
			height: 1080,
		});

		vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(
			existingProject,
		);
		vi.mocked(mockRepository.create).mockResolvedValue(duplicatedProject);

		const result = await useCase.execute({ id: projectId, userId });

		expect(mockRepository.findByUserIdAndId).toHaveBeenCalledWith(
			userId,
			projectId,
		);
		expect(mockRepository.create).toHaveBeenCalledWith({
			name: "Copy of Original Project",
			userId,
			json: existingProject.json,
			width: existingProject.width,
			height: existingProject.height,
			isTemplate: false,
			isPro: false,
		});
		expect(result.project.name).toBe("Copy of Original Project");
	});

	it("should throw error if project not found", async () => {
		const userId = "user-123";
		const projectId = "project-123";

		vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(null);

		await expect(useCase.execute({ id: projectId, userId })).rejects.toThrow(
			"Project not found",
		);
	});
});
