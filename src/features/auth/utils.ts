import { redirect } from "@tanstack/react-router";
import { auth } from "@/infrastructure/auth/better-auth";

export const protectServer = async () => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    if (!session?.user) {
      throw redirect({ to: "/sign-in" });
    }

    return session;
  } catch (error) {
    if (error instanceof redirect) {
      throw error;
    }
    throw redirect({ to: "/sign-in" });
  }
};
