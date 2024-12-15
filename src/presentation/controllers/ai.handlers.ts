import type { Context } from "hono";
import { container } from "@/infrastructure/di";

export async function generateImageHandler(c: Context) {
  try {
    const body = await c.req.json();
    const useCase = container.getGenerateImageUseCase();
    const result = await useCase.execute({ prompt: body.prompt });

    return c.json({ data: result.imageUrl });
  } catch (error) {
    return c.json({ error: "Failed to generate image" }, 500);
  }
}

export async function removeBackgroundHandler(c: Context) {
  try {
    const body = await c.req.json();
    const useCase = container.getRemoveBackgroundUseCase();
    const result = await useCase.execute({ image: body.image });

    return c.json({ data: result.imageUrl });
  } catch (error) {
    return c.json({ error: "Failed to remove background" }, 500);
  }
}

