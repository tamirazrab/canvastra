import { z } from "zod";

const createProjectParamsSchema = z.object({
  name: z.string().trim().min(1),
  json: z.string(),
  height: z.number().int().positive(),
  width: z.number().int().positive(),
});

export type CreateProjectParams = z.infer<typeof createProjectParamsSchema>;

export default createProjectParamsSchema;
