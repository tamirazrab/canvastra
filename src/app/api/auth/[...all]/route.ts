import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/auth";

// Function to get the correct auth instance based on environment
// This is called at runtime, not module load time, so env vars are available
function getAuthInstance() {
  // Check if we're in test mode
  // Test mode is when TEST_DATABASE_URL is set AND DATABASE_URL matches it
  const testDbUrl = process.env.TEST_DATABASE_URL;
  const dbUrl = process.env.DATABASE_URL;
  const isTestMode = !!testDbUrl && testDbUrl === dbUrl;

  if (isTestMode) {
    try {
      // Dynamically import test auth - this ensures it's only loaded in test mode
      const testAuthModule = require("@/auth.test");
      const testAuth = testAuthModule.testAuth;
      console.log(
        `[auth-route] ✅ Using TEST auth. TEST_DATABASE_URL matches DATABASE_URL`,
      );
      return testAuth;
    } catch (error) {
      console.error(
        `[auth-route] ❌ Failed to load test auth, falling back to production:`,
        error,
      );
      return auth;
    }
  } else {
    // Log which database we're using for debugging
    if (testDbUrl && dbUrl && testDbUrl !== dbUrl) {
      console.warn(
        `[auth-route] ⚠️  WARNING: TEST_DATABASE_URL is set but DATABASE_URL is different!`,
      );
      console.warn(
        `[auth-route] TEST_DATABASE_URL: ${testDbUrl.substring(0, 30)}...`,
      );
      console.warn(
        `[auth-route] DATABASE_URL: ${dbUrl.substring(0, 30)}...`,
      );
      console.warn(
        `[auth-route] Better Auth will use PRODUCTION database! This will cause test failures!`,
      );
    } else {
      console.log(
        `[auth-route] Using PRODUCTION auth. TEST_DATABASE_URL: ${testDbUrl ? "SET" : "NOT SET"}`,
      );
    }
    return auth;
  }
}

// Get auth instance - this will be evaluated when the route handler is called
const authInstance = getAuthInstance();

export const { GET, POST } = toNextJsHandler(authInstance);


