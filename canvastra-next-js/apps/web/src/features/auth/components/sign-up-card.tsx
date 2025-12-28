"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useSignUp } from "@/features/auth/hooks/use-sign-up";
import { authClient } from "@/lib/auth-client";

export const SignUpCard = () => {
	const [loading, setLoading] = useState(false);
	const [loadingGithub, setLoadingGithub] = useState(false);
	const [loadingGoogle, setLoadingGoogle] = useState(false);
	const router = useRouter();

	const mutation = useSignUp();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const onProviderSignUp = (provider: "github" | "google") => {
		setLoading(true);
		setLoadingGithub(provider === "github");
		setLoadingGoogle(provider === "google");

		window.location.href = `${authClient.baseURL}/signin/${provider}`;
	};

	const onCredentialSignUp = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		mutation.mutate(
			{
				name,
				email,
				password,
			},
			{
				onSuccess: async () => {
					await authClient.signIn.email(
						{
							email,
							password,
						},
						{
							onSuccess: () => {
								router.push("/");
								router.refresh();
							},
							onError: () => {
								setLoading(false);
							},
						},
					);
				},
			},
		);
	};

	return (
		<Card className="h-full w-full p-8">
			<CardHeader className="px-0 pt-0">
				<CardTitle>Create an account</CardTitle>
				<CardDescription>
					Use your email or another service to continue
				</CardDescription>
			</CardHeader>
			{!!mutation.error && (
				<div className="mb-6 flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-destructive text-sm">
					<TriangleAlert className="size-4" />
					<p>Something went wrong</p>
				</div>
			)}
			<CardContent className="space-y-5 px-0 pb-0">
				<form onSubmit={onCredentialSignUp} className="space-y-2.5">
					<Input
						disabled={mutation.isPending || loading}
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Full name"
						type="text"
						required
					/>
					<Input
						disabled={mutation.isPending || loading}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
						type="email"
						required
					/>
					<Input
						disabled={mutation.isPending || loading}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						type="password"
						required
						minLength={3}
						maxLength={20}
					/>
					<Button
						className="w-full"
						type="submit"
						size="lg"
						disabled={loading || mutation.isPending}
					>
						{mutation.isPending ? (
							<Loader2 className="top-2.5 left-2.5 mr-2 size-5 animate-spin" />
						) : (
							"Continue"
						)}
					</Button>
				</form>
				<Separator />
				<div className="flex flex-col gap-y-2.5">
					<Button
						disabled={mutation.isPending || loading}
						onClick={() => onProviderSignUp("google")}
						variant="outline"
						size="lg"
						className="relative w-full"
					>
						{loadingGoogle ? (
							<Loader2 className="absolute top-2.5 left-2.5 mr-2 size-5 animate-spin" />
						) : (
							<FcGoogle className="absolute top-2.5 left-2.5 mr-2 size-5" />
						)}
						Continue with Google
					</Button>
					<Button
						disabled={mutation.isPending || loading}
						onClick={() => onProviderSignUp("github")}
						variant="outline"
						size="lg"
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
					Already have an account?{" "}
					<Link href="/sign-in" onClick={() => setLoading(true)}>
						<span className="text-sky-700 hover:underline">Sign in</span>
					</Link>
				</p>
			</CardContent>
		</Card>
	);
};
