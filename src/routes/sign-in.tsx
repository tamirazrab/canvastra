// src/routes/sign-in.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignInCard } from "@/features/auth/components/sign-in-card";
import { auth } from "@/infrastructure/auth/better-auth";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: async () => {
    // Check if already authenticated
    try {
      const session = await auth.api.getSession({
        headers: new Headers(),
      });
      if (session?.user) {
        throw redirect({ to: "/" });
      }
    } catch (error) {
      if (error instanceof redirect) {
        throw error;
      }
      // Not authenticated, continue to sign-in page
    }
  },
  component: SignInPage,
});

function SignInPage() {
  return <SignInCard />;
}
