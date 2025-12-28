"use client";

import { SignInCard } from "@/features/auth/components/sign-in-card";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SignInPage = () => {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	useEffect(() => {
		if (session?.user) {
			router.push("/");
		}
	}, [session, router]);

	return <SignInCard />;
};

export default SignInPage;

