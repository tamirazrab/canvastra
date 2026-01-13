import { createApi } from "unsplash-js";
import { env } from "@/bootstrap/configs/env";

// Unsplash is optional - only initialize if key is provided
export const unsplash = env.UNSPLASH_ACCESS_KEY
  ? createApi({
      accessKey: env.UNSPLASH_ACCESS_KEY,
      fetch,
    })
  : null;
