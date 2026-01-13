import { z } from "zod";
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/bootstrap/boundaries/db/drizzle";
import { users, account } from "@/bootstrap/boundaries/db/schema";
import { createLogger } from "@/lib/logger";
import { rateLimiters } from "./middleware/rate-limit";

const logger = createLogger({ route: "/api/users" });

// User creation is sensitive - use auth rate limiter
const app = new Hono().use("*", rateLimiters.auth()).post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(3).max(20),
    }),
  ),
  async (c) => {
    const startTime = Date.now();
    const requestId = c.req.header("x-request-id") || `req-${Date.now()}`;

    try {
      logger.info("User creation request received", {
        requestId,
        email: c.req.valid("json").email,
        name: c.req.valid("json").name,
      });

      const { name, email, password } = c.req.valid("json");

      logger.debug("Request validation passed", {
        requestId,
        email,
        nameLength: name.length,
        passwordLength: password.length,
      });

      logger.debug("Hashing password", { requestId, email });
      const hashStartTime = Date.now();
      const hashedPassword = await bcrypt.hash(password, 12);
      const hashDuration = Date.now() - hashStartTime;
      logger.debug("Password hashed", {
        requestId,
        email,
        duration: `${hashDuration}ms`,
      });

      logger.debug("Checking if user exists", { requestId, email });
      const queryStartTime = Date.now();
      const query = await db.select().from(users).where(eq(users.email, email));
      const queryDuration = Date.now() - queryStartTime;
      logger.debug("User existence check completed", {
        requestId,
        email,
        exists: query.length > 0,
        duration: `${queryDuration}ms`,
      });

      if (query[0]) {
        logger.warn("User creation failed: email already in use", {
          requestId,
          email,
        });
        return c.json({ error: "Email already in use" }, 400);
      }

      logger.debug("Inserting new user into database", {
        requestId,
        email,
        name,
      });
      const insertStartTime = Date.now();

      // Generate user ID
      const userId = crypto.randomUUID();

      // Insert user first
      await db.insert(users).values({
        id: userId,
        email,
        name,
      });

      // Insert account with password (Better Auth stores passwords in account table)
      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: email,
        providerId: "credential",
        userId,
        password: hashedPassword,
      });
      const insertDuration = Date.now() - insertStartTime;
      logger.info("User created successfully", {
        requestId,
        email,
        name,
        duration: `${insertDuration}ms`,
        totalDuration: `${Date.now() - startTime}ms`,
      });

      return c.json(null, 200);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("User creation failed with error", error, {
        requestId,
        email: c.req.valid("json")?.email || "unknown",
        duration: `${duration}ms`,
      });
      throw error; // Let the error middleware handle it
    }
  },
);

export default app;
