import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteProjectUseCase } from "@/core/application/use-cases/project";
import { ProjectRepository } from "@/core/domain/repositories";
import { Project } from "@/core/domain/entities";
import { EntityNotFoundException, UnauthorizedException } from "@/core/domain/exceptions";

describe("DeleteProjectUseCase", () => {
  let mockRepository: ProjectRepository;
  let useCase: DeleteProjectUseCase;

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
    useCase = new DeleteProjectUseCase(mockRepository);
  });

  it("should delete project successfully", async () => {
    const project = new Project({
      id: "1",
      name: "Test Project",
      userId: "user1",
      json: "{}",
      width: 800,
      height: 600,
      thumbnailUrl: null,
      isTemplate: false,
      isPro: false,
    });

    vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(project);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

    const result = await useCase.execute({ projectId: "1", userId: "user1" });

    expect(result.success).toBe(true);
    expect(mockRepository.delete).toHaveBeenCalledWith("1", "user1");
  });

  it("should throw EntityNotFoundException when project not found", async () => {
    vi.mocked(mockRepository.findByUserIdAndId).mockResolvedValue(null);

    await expect(
      useCase.execute({ projectId: "non-existent", userId: "user1" })
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
      useCase.execute({ projectId: "1", userId: "user1" })
    ).rejects.toThrow(UnauthorizedException);
  });
});

