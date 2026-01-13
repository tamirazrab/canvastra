import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import type { Session } from "@/auth";

/**
 * Get the current authenticated user from session.
 * Returns null if not authenticated.
 * Uses better-auth's session API to check authentication status.
 */
export async function getCurrentUser(): Promise<Session["user"] | null> {
  const session = await getSession();
  // better-auth returns { data: { user, session } } if authenticated, or { data: null } if not
  if (!session?.data || !session.data.user) {
    return null;
  }
  return session.data.user;
}

/**
 * Get the current user ID from session.
 * Returns null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/**
 * Protect a server component/action by requiring authentication.
 * Redirects to sign-in if not authenticated.
 * Uses better-auth's session API to verify authentication.
 * @param lang - Language code for redirect path
 */
export async function protectServer(lang: string = "en"): Promise<void> {
  const session = await getSession();
  // better-auth returns { data: { user, session } } if authenticated, or { data: null } if not
  if (!session?.data || !session.data.user) {
    redirect(`/${lang}/sign-in`);
  }
}

/**
 * Require authentication and return the user.
 * Redirects to sign-in if not authenticated (for use in server actions).
 * Uses better-auth's session API to verify authentication.
 * @param lang - Language code for redirect path
 */
export async function requireAuth(
  lang: string = "en",
): Promise<Session["user"]> {
  const session = await getSession();
  // better-auth returns { data: { user, session } } if authenticated, or { data: null } if not
  if (!session?.data || !session.data.user) {
    redirect(`/${lang}/sign-in`);
  }
  return session.data.user;
}

/**
 * Require authentication and return the user ID.
 * Redirects to sign-in if not authenticated (for use in server actions).
 * Uses better-auth's session API to verify authentication.
 * @param lang - Language code for redirect path
 */
export async function requireUserId(lang: string = "en"): Promise<string> {
  const session = await getSession();
  // better-auth returns { data: { user, session } } if authenticated, or { data: null } if not
  if (!session?.data || !session.data.user || !session.data.user.id) {
    redirect(`/${lang}/sign-in`);
  }
  return session.data.user.id;
}
