import { z } from "zod";

const getSubscriptionParamsSchema = z.object({
  userId: z.string(),
});

export type GetSubscriptionParams = z.infer<typeof getSubscriptionParamsSchema>;

export default getSubscriptionParamsSchema;
