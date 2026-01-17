import "reflect-metadata";

// Set up minimal test environment variables
// These are required by the env validation but don't need to be real values for unit tests
// Note: NODE_ENV is read-only, so we only set it if it's not already set via Object.defineProperty
if (!process.env.NODE_ENV) {
  Object.defineProperty(process.env, "NODE_ENV", {
    value: "test",
    writable: true,
    configurable: true,
  });
}

// Set required environment variables for unit tests
// These are minimal values that pass validation but aren't used in unit tests
if (!process.env.NEXT_PUBLIC_APP_URL) {
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
}

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = "test-auth-secret-minimum-32-characters-long-for-validation";
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
}
