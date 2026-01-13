/**
 * Sign Up Page
 *
 * Route: /[lang]/sign-up
 * - If user is already authenticated, redirects to editor
 * - Otherwise, displays the sign-up form
 */
import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import { ErrorBoundary } from "@/app/components/error-boundary";
import { SignUpCard } from "./view/client/sign-up-card";

interface SignUpPageProps {
  params: Promise<{
    lang: string;
  }>;
}

async function SignUpPage({ params }: SignUpPageProps) {
  const { lang } = await params;
  const session = await getSession();

  // better-auth returns { data: { user, session } } if authenticated, or { data: null } if not
  // If user is already authenticated, redirect to editor
  if (session?.data && session.data.user) {
    redirect(`/${lang}/editor`);
  }

  return (
    <ErrorBoundary>
      <SignUpCard />
    </ErrorBoundary>
  );
}

export default SignUpPage;
