import type { Context } from "hono";
import { container } from "@/infrastructure/di";

export async function signUpHandler(c: Context) {
  try {
    const body = await c.req.json();
    const useCase = container.getSignUpUseCase();
    const result = await useCase.execute({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    return c.json(null, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Email already in use") {
      return c.json({ error: message }, 400);
    }
    return c.json({ error: "Failed to create user" }, 500);
  }
}

export async function signInHandler(c: Context) {
  try {
    const body = await c.req.json();
    const useCase = container.getSignInUseCase();
    const result = await useCase.execute({
      email: body.email,
      password: body.password,
    });

    // Return user data (better-auth will handle session)
    return c.json({ user: result.user }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Invalid credentials") {
      return c.json({ error: message }, 401);
    }
    return c.json({ error: "Failed to sign in" }, 500);
  }
}

export async function getSessionHandler(c: Context) {
  try {
    // Get userId from auth context (will be set by better-auth middleware)
    const userId = c.get("userId") as string | undefined;
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const useCase = container.getGetSessionUseCase();
    const result = await useCase.execute({ userId });

    if (!result.user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user: result.user }, 200);
  } catch (error) {
    return c.json({ error: "Failed to get session" }, 500);
  }
}

