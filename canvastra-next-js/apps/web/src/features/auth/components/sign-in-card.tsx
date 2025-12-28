"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

export const SignInCard = () => {
	const [loading, setLoading] = useState(false);
	const [loadingGithub, setLoadingGithub] = useState(false);
	const [loadingGoogle, setLoadingGoogle] = useState(false);
	const [loadingLogin, setLoadingLogin] = useState(false);
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const params = useSearchParams();
	const error = params.get("error");

	const onCredentialSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setLoadingLogin(true);

		await authClient.signIn.email(
			{
				email: email,
				password: password,
			},
			{
				onSuccess: () => {
					router.push("/");
					router.refresh();
				},
				onError: () => {
					setLoading(false);
					setLoadingLogin(false);
				},
			},
		);
	};

	const onProviderSignIn = (provider: "github" | "google") => {
		setLoading(true);
		setLoadingGithub(provider === "github");
		setLoadingGoogle(provider === "google");

		window.location.href = `${authClient.baseURL}/signin/${provider}`;
	};

	return (
		<Card className="h-full w-full p-8">
			<CardHeader className="px-0 pt-0">
				<CardTitle>Login to continue</CardTitle>
				<CardDescription>
					Use your email or another service to continue
				</CardDescription>
			</CardHeader>
			{!!error && (
				<div className="mb-6 flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-destructive text-sm">
					<TriangleAlert className="size-4" />
					<p>Invalid email or password</p>
				</div>
			)}
			<CardContent className="space-y-5 px-0 pb-0">
				<form onSubmit={onCredentialSignIn} className="space-y-2.5">
					<Input
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
						type="email"
						disabled={loading || loadingLogin}
						required
					/>
					<Input
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						type="password"
						disabled={loading || loadingLogin}
						required
					/>
					<Button className="w-full" type="submit" size="lg" disabled={loading}>
						{loadingLogin ? (
							<Loader2 className="top-2.5 left-2.5 mr-2 size-5 animate-spin" />
						) : (
							"Continue"
						)}
					</Button>
				</form>
				<Separator />
				<div className="flex flex-col gap-y-2.5">
					<Button
						onClick={() => onProviderSignIn("google")}
						size="lg"
						variant="outline"
						className="relative w-full"
						disabled={loading}
					>
						{loadingGoogle ? (
							<Loader2 className="absolute top-2.5 left-2.5 mr-2 size-5 animate-spin" />
						) : (
							<FcGoogle className="absolute top-2.5 left-2.5 mr-2 size-5" />
						)}
						Continue with Google
					</Button>
					<Button
						onClick={() => onProviderSignIn("github")}
						size="lg"
						variant="outline"
						disabled={loading}
						className="relative w-full"
					>
						{loadingGithub ? (
							<Loader2 className="absolute top-2.5 left-2.5 mr-2 size-5 animate-spin" />
						) : (
							<FaGithub className="absolute top-2.5 left-2.5 mr-2 size-5" />
						)}
						Continue with Github
					</Button>
				</div>
				<p className="text-muted-foreground text-xs">
					Don&apos;t have an account?{" "}
					<Link href="/sign-up" onClick={() => setLoading(true)}>
						<span className="text-sky-700 hover:underline">Sign up</span>
					</Link>
				</p>
			</CardContent>
		</Card>
	);
};
