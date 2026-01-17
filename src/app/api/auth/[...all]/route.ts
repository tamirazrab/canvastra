import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/auth";

// Function to get the correct auth instance based on environment
// This is called at runtime, not module load time, so env vars are available
function getAuthInstance() {
  // Check if we're in test mode
  // Test mode is when TEST_DATABASE_URL is set (regardless of DATABASE_URL)
  // This is more reliable because DATABASE_URL might be set from .env.local
  const testDbUrl = process.env.TEST_DATABASE_URL;
  const dbUrl = process.env.DATABASE_URL;
  const isTestMode = !!testDbUrl;

  if (isTestMode) {
    try {
      // Dynamically import test auth - this ensures it's only loaded in test mode
      const testAuthModule = require("@/auth.test");
      const testAuth = testAuthModule.testAuth;
      console.log(
        `[auth-route] ✅ Using TEST auth. TEST_DATABASE_URL is set`,
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
    console.log(
      `[auth-route] Using PRODUCTION auth. TEST_DATABASE_URL: ${testDbUrl ? "SET" : "NOT SET"}`,
    );
    return auth;
  }
}

// Get auth instance - this will be evaluated when the route handler is called
const authInstance = getAuthInstance();

export const { GET, POST } = toNextJsHandler(authInstance);


