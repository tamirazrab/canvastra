import { Context } from "hono";

/**
 * Extended Hono context with typed authUser
 */
export interface AuthUser {
  token: {
    id: string;
    email: string;
    name: string;
  };
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}

/**
 * Type helper to get typed context
 */
export type TypedContext = Context & {
  get: {
    (key: "authUser"): AuthUser;
    (key: "requestId"): string;
    <T>(key: string): T;
  };
  set: {
    (key: "authUser", value: AuthUser): void;
    (key: "requestId", value: string): void;
    (key: string, value: unknown): void;
  };
};
