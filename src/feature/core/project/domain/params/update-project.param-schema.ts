import { z } from "zod";

const updateProjectParamsSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).optional(),
  json: z.string().optional(),
  height: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
});

export type UpdateProjectParams = z.infer<typeof updateProjectParamsSchema>;

export default updateProjectParamsSchema;
