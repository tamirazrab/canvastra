/**
 * Sign In Page
 *
 * Route: /[lang]/sign-in
 * - If user is already authenticated, redirects to editor
 * - Otherwise, displays the sign-in form
 */
import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import { SignInCard } from "./view/client/sign-in-card";

interface SignInPageProps {
  params: Promise<{
    lang: string;
  }>;
}

async function SignInPage({ params }: SignInPageProps) {
  const { lang } = await params;
  const session = await getSession();

  // better-auth returns { data: { user, session } } if authenticated, or { data: null } if not
  // If user is already authenticated, redirect to editor
  if (session?.data && session.data.user) {
    redirect(`/${lang}/editor`);
  }

  return <SignInCard />;
}

export default SignInPage;
