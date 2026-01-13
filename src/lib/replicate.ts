import Replicate from "replicate";
import { env } from "@/bootstrap/configs/env";

// Replicate is optional - only initialize if token is provided
export const replicate = env.REPLICATE_API_TOKEN
  ? new Replicate({
      auth: env.REPLICATE_API_TOKEN,
    })
  : null;
