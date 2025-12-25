import { hc } from "hono/client";

import { AppType } from "@/app/api/[[...route]]/route";

const apiUrl =
  typeof window !== "undefined"
    ? import.meta.env.VITE_APP_URL || "http://localhost:3000"
    : import.meta.env.VITE_APP_URL || "http://localhost:3000";

export const client = hc<AppType>(apiUrl);
