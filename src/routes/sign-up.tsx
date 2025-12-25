// src/routes/sign-up.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignUpCard } from "@/features/auth/components/sign-up-card";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/sign-up")({
  beforeLoad: async () => {
    // Check if already authenticated
    try {
      const { data } = await authClient.getSession({
        fetchOptions: {
          headers: new Headers(),
        }
      });
      if (data?.user) {
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
