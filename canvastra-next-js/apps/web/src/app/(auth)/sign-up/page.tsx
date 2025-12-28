"use client";

import { SignUpCard } from "@/features/auth/components/sign-up-card";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SignUpPage = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      router.push("/");
    }
  }, [session, router]);

  return <SignUpCard />;
};

export default SignUpPage;

