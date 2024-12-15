import type { Context } from "hono";
import { container } from "@/infrastructure/di";

export async function getImagesHandler(c: Context) {
  try {
    const useCase = container.getGetImagesUseCase();
    const result = await useCase.execute();

    return c.json({ data: result.images });
  } catch (error) {
    return c.json({ error: "Failed to get images" }, 500);
  }
}

