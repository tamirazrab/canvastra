import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenerateImageUseCase } from "@/core/application/use-cases/ai";
import { ImageGenerationService } from "@/core/domain/services";

describe("GenerateImageUseCase", () => {
  let mockService: ImageGenerationService;
  let useCase: GenerateImageUseCase;

  beforeEach(() => {
    mockService = {
      generateImage: vi.fn(),
      removeBackground: vi.fn(),
    };
    useCase = new GenerateImageUseCase(mockService);
  });

  it("should generate image successfully", async () => {
    const prompt = "A beautiful sunset";
    const imageUrl = "https://example.com/image.jpg";

    vi.mocked(mockService.generateImage).mockResolvedValue(imageUrl);

    const result = await useCase.execute({ prompt });

    expect(result.imageUrl).toBe(imageUrl);
    expect(mockService.generateImage).toHaveBeenCalledWith(prompt);
  });
});

