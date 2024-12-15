import { createApi } from "unsplash-js";

export const unsplash = createApi({
      accessKey: process.env.VITE_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY!,
  fetch: fetch,
});
