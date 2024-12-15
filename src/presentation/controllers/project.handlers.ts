import type { Context } from "hono";
import { container } from "@/infrastructure/di";

export async function getProjectHandler(c: Context) {
  try {
    const userId = c.get("userId") as string | undefined;
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projectId = c.req.param("id");
    const useCase = container.getGetProjectUseCase();
    const result = await useCase.execute({ projectId, userId });

    return c.json({ data: result.project }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Project not found") {
      return c.json({ error: message }, 404);
    }
    return c.json({ error: "Failed to get project" }, 500);
  }
}

export async function getProjectsHandler(c: Context) {
  try {
    const userId = c.get("userId") as string | undefined;
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;

    const useCase = container.getGetProjectsUseCase();
    const result = await useCase.execute({ userId, page, limit });

    return c.json({
      data: result.projects,
      nextPage: result.nextPage,
    });
  } catch (error) {
    return c.json({ error: "Failed to get projects" }, 500);
  }
}

export async function createProjectHandler(c: Context) {
  try {
    const userId = c.get("userId") as string | undefined;
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const useCase = container.getCreateProjectUseCase();
    const result = await useCase.execute({
      userId,
      name: body.name,
      json: body.json,
      width: body.width,
      height: body.height,
    });

    return c.json({ data: result.project }, 200);
  } catch (error) {
    return c.json({ error: "Failed to create project" }, 500);
  }
}

export async function updateProjectHandler(c: Context) {
  try {
    const userId = c.get("userId") as string | undefined;
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projectId = c.req.param("id");
    const body = await c.req.json();

    const useCase = container.getUpdateProjectUseCase();
    const result = await useCase.execute({
      projectId,
      userId,
      updates: body,
    });

    return c.json({ data: result.project }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("not found") || message.includes("unauthorized")) {
      return c.json({ error: message }, 401);
    }
    return c.json({ error: "Failed to update project" }, 500);
  }
}

export async function deleteProjectHandler(c: Context) {
  try {
    const userId = c.get("userId") as string | undefined;
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projectId = c.req.param("id");
    const useCase = container.getDeleteProjectUseCase();
    await useCase.execute({ projectId, userId });

    return c.json({ data: { id: projectId } }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("not found") || message.includes("unauthorized")) {
      return c.json({ error: message }, 404);
    }
    return c.json({ error: "Failed to delete project" }, 500);
  }
}

export async function duplicateProjectHandler(c: Context) {
  try {
    const userId = c.get("userId") as string | undefined;
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projectId = c.req.param("id");
    const useCase = container.getDuplicateProjectUseCase();
    const result = await useCase.execute({ projectId, userId });

    return c.json({ data: result.project }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("not found") || message.includes("unauthorized")) {
      return c.json({ error: message }, 404);
    }
    return c.json({ error: "Failed to duplicate project" }, 500);
  }
}

export async function getTemplatesHandler(c: Context) {
  try {
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;

    const useCase = container.getGetTemplatesUseCase();
    const result = await useCase.execute({ page, limit });

    return c.json({ data: result.templates });
  } catch (error) {
    return c.json({ error: "Failed to get templates" }, 500);
  }
}

