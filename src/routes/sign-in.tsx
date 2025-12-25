// src/routes/sign-in.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignInCard } from "@/features/auth/components/sign-in-card";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/sign-in")({
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
      // Not authenticated, continue to sign-in page
    }
  },
  component: SignInPage,
});

function SignInPage() {
  return <SignInCard />;
}
