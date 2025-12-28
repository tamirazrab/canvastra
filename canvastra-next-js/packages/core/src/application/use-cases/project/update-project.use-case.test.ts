import { beforeEach, describe, expect, it, vi } from "vitest";
import { Project } from "../../../domain/entities";
import type { ProjectRepository } from "../../../domain/repositories";
import { UpdateProjectUseCase } from "./update-project.use-case";

describe("UpdateProjectUseCase", () => {
	let mockRepository: ProjectRepository;
	let useCase: UpdateProjectUseCase;

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

		useCase = new UpdateProjectUseCase(mockRepository);
	});

	it("should update project JSON", async () => {
		const userId = "user-123";
		const projectId = "project-123";
		const newJson = '{"objects": []}';

		const existingProject = new Project({
			id: projectId,
			name: "Test Project",
			userId,
			json: "{}",
			width: 1920,
			height: 1080,
		});

		vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(
			existingProject,
		);
		vi.mocked(mockRepository.update).mockImplementation(
			async (project) => project,
		);

		const result = await useCase.execute({
			userId,
			projectId,
			json: newJson,
		});

		expect(mockRepository.findByUserIdAndId).toHaveBeenCalledWith(
			userId,
			projectId,
		);
		expect(mockRepository.update).toHaveBeenCalled();
		expect(result.project.json).toBe(newJson);
	});

	it("should update project dimensions", async () => {
		const userId = "user-123";
		const projectId = "project-123";

		const existingProject = new Project({
			id: projectId,
			name: "Test Project",
			userId,
			json: "{}",
			width: 1920,
			height: 1080,
		});

		vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(
			existingProject,
		);
		vi.mocked(mockRepository.update).mockImplementation(
			async (project) => project,
		);

		const result = await useCase.execute({
			userId,
			projectId,
			width: 800,
			height: 600,
		});

		expect(result.project.width).toBe(800);
		expect(result.project.height).toBe(600);
	});

	it("should throw error if project not found", async () => {
		const userId = "user-123";
		const projectId = "project-123";

		vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(null);

		await expect(
			useCase.execute({
				userId,
				projectId,
				json: "{}",
			}),
		).rejects.toThrow("Project not found");
	});

	it("should throw error if user does not own project", async () => {
		const userId = "user-123";
		const projectId = "project-123";

		const existingProject = new Project({
			id: projectId,
			name: "Test Project",
			userId: "other-user",
			json: "{}",
			width: 1920,
			height: 1080,
		});

		vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(
			existingProject,
		);

		await expect(
			useCase.execute({
				userId,
				projectId,
				json: "{}",
			}),
		).rejects.toThrow("Unauthorized");
	});
});
