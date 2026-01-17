/**
 * Mock for server-only module.
 * This allows unit tests to import modules that use "server-only" without errors.
 * In actual Next.js server components, server-only prevents client-side usage,
 * but in unit tests we need to allow it.
 */

// Empty export - just allows the import to work without throwing
export { };


