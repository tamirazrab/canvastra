// src/routes/sign-up.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignUpCard } from "@/features/auth/components/sign-up-card";
import { auth } from "@/infrastructure/auth/better-auth";

export const Route = createFileRoute("/sign-up")({
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
      // Not authenticated, continue to sign-up page
    }
  },
  component: SignUpPage,
});

function SignUpPage() {
  return <SignUpCard />;
}
