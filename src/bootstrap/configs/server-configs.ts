import "server-only";
import { env } from "./env";

/**
 * You can put all configs which shouldn't be mapped to the client side.
 */
const serverConfigs = {
  env: {
    idp: env.IDP_URL
      ? {
          url: env.IDP_URL,
          clientId: env.IDP_CLIENT_ID!,
          clientSecret: env.IDP_CLIENT_SECRET!,
        }
      : undefined,
    backendApi: env.BACKEND_BASE_HOST
      ? {
          url: env.BACKEND_BASE_HOST,
        }
      : undefined,
  },
  cookies: {
    authToken: "auth-token",
    authProfile: "auth-profile",
  },
};

export default serverConfigs;
