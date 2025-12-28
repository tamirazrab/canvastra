import { beforeEach, describe, expect, it, vi } from "vitest";
import { Project } from "../../../domain/entities";
import type { ProjectRepository } from "../../../domain/repositories";
import { GetProjectsUseCase } from "./get-projects.use-case";

describe("GetProjectsUseCase", () => {
	let mockRepository: ProjectRepository;
	let useCase: GetProjectsUseCase;

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

		useCase = new GetProjectsUseCase(mockRepository);
	});

	it("should get projects for a user", async () => {
		const userId = "user-123";
		const page = 1;
		const limit = 10;

		const mockProjects = [
			new Project({
				id: "project-1",
				name: "Project 1",
				userId,
				json: "{}",
				width: 1920,
				height: 1080,
			}),
			new Project({
				id: "project-2",
				name: "Project 2",
				userId,
				json: "{}",
				width: 1920,
				height: 1080,
			}),
		];

		vi.mocked(mockRepository.findByUserId).mockResolvedValue(mockProjects);

		const result = await useCase.execute({ userId, page, limit });

		expect(mockRepository.findByUserId).toHaveBeenCalledWith(
			userId,
			page,
			limit,
		);
		expect(result.projects).toEqual(mockProjects);
		expect(result.nextPage).toBe(null); // Only 2 projects, less than limit
	});

	it("should return nextPage when results equal limit", async () => {
		const userId = "user-123";
		const page = 1;
		const limit = 10;

		// Create exactly 10 projects
		const mockProjects = Array.from(
			{ length: 10 },
			(_, i) =>
				new Project({
					id: `project-${i}`,
					name: `Project ${i}`,
					userId,
					json: "{}",
					width: 1920,
					height: 1080,
				}),
		);

		vi.mocked(mockRepository.findByUserId).mockResolvedValue(mockProjects);

		const result = await useCase.execute({ userId, page, limit });

		expect(result.projects).toHaveLength(10);
		expect(result.nextPage).toBe(2); // Should indicate next page
	});

	it("should handle empty results", async () => {
		const userId = "user-123";
		const page = 1;
		const limit = 10;

		vi.mocked(mockRepository.findByUserId).mockResolvedValue([]);

		const result = await useCase.execute({ userId, page, limit });

		expect(result.projects).toEqual([]);
		expect(result.nextPage).toBe(null);
	});
});
