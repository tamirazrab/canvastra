import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { isLeft } from "fp-ts/lib/Either";
import createProjectController from "@/feature/core/editor/application/controller/create-project.controller";
import getProjectController from "@/feature/core/editor/application/controller/get-project.controller";
import getProjectsController from "@/feature/core/editor/application/controller/get-projects.controller";
import updateProjectController from "@/feature/core/editor/application/controller/update-project.controller";
import deleteProjectController from "@/feature/core/editor/application/controller/delete-project.controller";
import duplicateProjectController from "@/feature/core/editor/application/controller/duplicate-project.controller";
import getTemplatesController from "@/feature/core/editor/application/controller/get-templates.controller";
import { projectsInsertSchema } from "@/bootstrap/boundaries/db/schema";
import { sanitizeProjectJson } from "@/lib/sanitize";
import { verifyBetterAuth } from "./middleware/better-auth";
import { handleApiResult } from "./helpers/handle-api-result";
import type { AuthUser } from "./types/hono-context";

const app = new Hono()
  .get(
    "/templates",
    verifyBetterAuth(),
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      }),
    ),
    async (c) => {
      const { page, limit } = c.req.valid("query");
      const skip = (page - 1) * limit;

      const result = await getTemplatesController({ limit, skip });

      if (isLeft(result)) {
        return c.json({ error: result.left.message }, 400);
      }

      return c.json({
        data: result.right.items,
        nextPage: result.right.items.length === limit ? page + 1 : null,
      });
    },
  )
  .delete(
    "/:id",
    verifyBetterAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser") as unknown as AuthUser;
      const { id } = c.req.valid("param");

      if (!auth?.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const result = await deleteProjectController(id, auth.token.id);

      if (isLeft(result)) {
        return c.json({ error: result.left.message }, 404);
      }

      return c.json({ data: { id } });
    },
  )
  .post(
    "/:id/duplicate",
    verifyBetterAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser") as unknown as AuthUser;
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const result = await duplicateProjectController(id, auth.token.id);

      if (isLeft(result)) {
        return c.json({ error: result.left.message }, 404);
      }

      return c.json({ data: result.right });
    },
  )
  .get(
    "/",
    verifyBetterAuth(),
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser") as unknown as AuthUser;
      const { page, limit } = c.req.valid("query");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const skip = (page - 1) * limit;
      const result = await getProjectsController({
        limit,
        skip,
        userId: auth.token.id,
      });

      if (isLeft(result)) {
        return c.json({ error: result.left.message }, 400);
      }

      return c.json({
        data: result.right.items,
        nextPage: result.right.items.length === limit ? page + 1 : null,
      });
    },
  )
  .patch(
    "/:id",
    verifyBetterAuth(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      projectsInsertSchema
        .omit({
          id: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        })
        .partial(),
    ),
    async (c) => {
      const auth = c.get("authUser") as unknown as AuthUser;
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Sanitize user-generated JSON content if present
      const sanitizedValues = {
        ...values,
        ...(values.json && {
          json: sanitizeProjectJson(values.json as string),
        }),
      };

      const result = await updateProjectController({
        id,
        ...sanitizedValues,
        userId: auth.token.id,
      });

      if (isLeft(result)) {
        const failure = result.left as { namespace: string; message: string };
        const status = failureToHttpStatus(failure);
        // Hono accepts status codes as numbers
        return c.json(
          { error: failure.message },
          status as 400 | 401 | 403 | 404 | 500,
        );
      }

      return c.json({ data: result.right });
    },
  )
  .get(
    "/:id",
    verifyBetterAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser") as unknown as AuthUser;
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const result = await getProjectController(id, auth.token.id);

      if (isLeft(result)) {
        return c.json({ error: result.left.message }, 404);
      }

      return c.json({ data: result.right });
    },
  )
  .post(
    "/",
    verifyBetterAuth(),
    zValidator(
      "json",
      projectsInsertSchema.pick({
        name: true,
        json: true,
        width: true,
        height: true,
      }),
    ),
    async (c) => {
      const auth = c.get("authUser") as unknown as AuthUser;
      const { name, json, height, width } = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Sanitize user-generated JSON content to prevent XSS
      const sanitizedJson = sanitizeProjectJson(json);

      const result = await createProjectController({
        name,
        json: sanitizedJson,
        height,
        width,
        userId: auth.token.id,
      });

      if (isLeft(result)) {
        return c.json({ error: result.left.message }, 400);
      }

      return c.json({ data: result.right });
    },
  );

export default app;
