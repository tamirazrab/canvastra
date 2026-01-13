"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";
import { createLogger } from "@/lib/logger";

type LoadingState = "idle" | "email" | "github";

const logger = createLogger({ component: "SignUpCard" });

export function SignUpCard() {
  const params = useParams();
  const router = useRouter();
  const { lang } = params as { lang: string };
  const [loading, setLoading] = useState<LoadingState>("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleInputChange = useCallback(
    (field: "name" | "email" | "password") =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      },
    [],
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const startTime = Date.now();
      const requestId = `signup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      logger.info("Sign-up form submitted", {
        requestId,
        email: formData.email,
        name: formData.name,
        passwordLength: formData.password.length,
        lang,
      });

      setLoading("email");

      try {
        logger.debug("Initiating user sign-up with better-auth", {
          requestId,
          email: formData.email,
          name: formData.name,
        });

        // Use better-auth's signUp method to create user properly
        const signUpRes = await authClient.signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });

        if (signUpRes.error) {
          logger.error(
            "Sign-up failed",
            new Error(signUpRes.error.message || "Unknown sign-up error"),
            {
              requestId,
              email: formData.email,
              signUpError: signUpRes.error,
            },
          );
          const errorMessage =
            signUpRes.error.message || "Failed to create account";
          toast.error(errorMessage);
          setLoading("idle");
          return;
        }

        logger.info("User account created successfully via better-auth", {
          requestId,
          email: formData.email,
          duration: `${Date.now() - startTime}ms`,
        });

        // Better-auth signUp might automatically sign in the user
        // If not, we'll sign in manually
        if (!signUpRes.data?.user) {
          logger.debug("User created but not signed in, initiating sign-in", {
            requestId,
            email: formData.email,
          });

          const signInStartTime = Date.now();
          const signInRes = await authClient.signIn.email({
            email: formData.email,
            password: formData.password,
          });

          if (signInRes.error) {
            logger.error(
              "Sign-in failed after account creation",
              new Error(signInRes.error.message || "Unknown sign-in error"),
              {
                requestId,
                email: formData.email,
                signInError: signInRes.error,
                signInDuration: `${Date.now() - signInStartTime}ms`,
              },
            );
            toast.error(
              "Account created but sign in failed. Please try signing in manually.",
            );
            setLoading("idle");
            return;
          }

          logger.info("Sign-in successful after sign-up", {
            requestId,
            email: formData.email,
            signInDuration: `${Date.now() - signInStartTime}ms`,
            totalDuration: `${Date.now() - startTime}ms`,
          });
        } else {
          logger.info("User signed up and automatically signed in", {
            requestId,
            email: formData.email,
            totalDuration: `${Date.now() - startTime}ms`,
          });
        }

        // Refresh server components to pick up the new session
        router.refresh();
        // Navigate to editor - cookies are already set by better-auth
        router.push(`/${lang}/editor`);
      } catch (err) {
        const duration = Date.now() - startTime;
        logger.error("Sign-up process failed with exception", err, {
          requestId,
          email: formData.email,
          duration: `${duration}ms`,
        });
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        toast.error(errorMessage);
        setLoading("idle");
      }
    },
    [formData, lang, router],
  );

  const onGithubSignIn = useCallback(async () => {
    const requestId = `github-signin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    logger.info("GitHub sign-in initiated", { requestId, lang });
    setLoading("github");
    try {
      logger.debug("Calling GitHub OAuth", {
        requestId,
        callbackURL: `/${lang}/editor`,
      });
      await authClient.signIn.social({
        provider: "github",
        callbackURL: `/${lang}/editor`,
      });
      logger.info("GitHub OAuth redirect initiated", { requestId });
    } catch (error) {
      logger.error("GitHub sign-in failed", error, { requestId, lang });
      toast.error("Failed to sign in with GitHub");
      setLoading("idle");
    }
  }, [lang]);

  const isDisabled = useMemo(() => loading !== "idle", [loading]);

  return (
    <Card className="border-none shadow-none bg-white/10 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">
          Create an account
        </CardTitle>
        <CardDescription className="text-white/80">
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange("name")}
              disabled={isDisabled}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleInputChange("email")}
              disabled={isDisabled}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange("password")}
              disabled={isDisabled}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
            />
          </div>
          <Button
            type="submit"
            disabled={isDisabled}
            className="w-full bg-white text-black hover:bg-white/90"
          >
            {loading === "email" ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-white/80">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            onClick={onGithubSignIn}
            disabled={isDisabled}
            variant="outline"
            className="w-full mt-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            {loading === "github" ? (
              <Loader2 className="mr-2 size-5 top-2.5 left-2.5 absolute animate-spin" />
            ) : (
              <FaGithub className="mr-2 size-5 top-2.5 left-2.5 absolute" />
            )}
            Continue with Github
          </Button>
        </div>
        <p className="text-xs text-white/80 mt-4">
          Already have an account?{" "}
          <Link href={`/${lang}/sign-in`}>
            <span className="text-sky-300 hover:underline">Sign in</span>
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
