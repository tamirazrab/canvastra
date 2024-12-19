import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateProjectUseCase } from "@/core/application/use-cases/project";
import { ProjectRepository } from "@/core/domain/repositories";
import { Project } from "@/core/domain/entities";
import { EntityNotFoundException, UnauthorizedException } from "@/core/domain/exceptions";

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

  it("should update project successfully", async () => {
    const existingProject = new Project({
      id: "1",
      name: "Original",
      userId: "user1",
      json: "{}",
      width: 800,
      height: 600,
      thumbnailUrl: null,
      isTemplate: false,
      isPro: false,
    });

    const updatedProject = existingProject.updateJson('{"key": "value"}');

    vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(existingProject);
    vi.mocked(mockRepository.update).mockResolvedValue(updatedProject);

    const result = await useCase.execute({
      projectId: "1",
      userId: "user1",
      updates: { json: '{"key": "value"}' },
    });

    expect(result.project.json).toBe('{"key": "value"}');
    expect(mockRepository.update).toHaveBeenCalled();
  });

  it("should throw EntityNotFoundException when project not found", async () => {
    vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(null);

    await expect(
      useCase.execute({
        projectId: "non-existent",
        userId: "user1",
        updates: { name: "New Name" },
      })
    ).rejects.toThrow(EntityNotFoundException);
  });

  it("should throw UnauthorizedException when project belongs to different user", async () => {
    const project = new Project({
      id: "1",
      name: "Test",
      userId: "user2",
      json: "{}",
      width: 800,
      height: 600,
      thumbnailUrl: null,
      isTemplate: false,
      isPro: false,
    });

    vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(project);

    await expect(
      useCase.execute({
        projectId: "1",
        userId: "user1",
        updates: { name: "New Name" },
      })
    ).rejects.toThrow(UnauthorizedException);
  });
});

