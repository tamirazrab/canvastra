import { testEnvConfig, isServiceAvailable } from "./test-env.config";

/**
 * External services configuration and stubbing rules.
 * 
 * Defines which external services should be stubbed vs. used in real mode.
 * Only external third-party services outside the system boundary are stubbed.
 */

export interface ExternalServiceConfig {
  /**
   * Service name identifier.
   */
  name: string;

  /**
   * Whether to use real service in tests.
   * If false, service will be stubbed.
   */
  useReal: boolean;

  /**
   * Test mode configuration (if applicable).
   */
  testMode?: {
    enabled: boolean;
    config?: Record<string, unknown>;
  };

  /**
   * Whether service is required for tests to run.
   */
  required: boolean;

  /**
   * Skip tests if service is not available.
   */
  skipIfUnavailable: boolean;
}

/**
 * External services configuration.
 * Only services outside the system boundary are configured here.
 */
export const externalServicesConfig: Record<string, ExternalServiceConfig> = {
  stripe: {
    name: "Stripe",
    useReal: true, // Use Stripe test mode
    testMode: {
      enabled: true,
      config: {
        apiVersion: "2025-12-15.clover",
      },
    },
    required: false, // Subscription tests can be skipped if Stripe not configured
    skipIfUnavailable: true,
  },
  replicate: {
    name: "Replicate AI",
    useReal: true, // Use real Replicate API (optional)
    required: false, // AI feature tests can be skipped if Replicate not configured
    skipIfUnavailable: true,
  },
  unsplash: {
    name: "Unsplash",
    useReal: false, // Stub Unsplash (not critical for E2E)
    required: false,
    skipIfUnavailable: true,
  },
  uploadthing: {
    name: "UploadThing",
    useReal: false, // Stub UploadThing (not critical for E2E)
    required: false,
    skipIfUnavailable: true,
  },
} as const;

/**
 * Check if external service should be stubbed.
 */
export function shouldStubService(serviceName: string): boolean {
  const config = externalServicesConfig[serviceName];
  if (!config) {
    return false; // Unknown service, don't stub
  }
  return !config.useReal;
}

/**
 * Check if external service is available for testing.
 */
export function isExternalServiceAvailable(serviceName: string): boolean {
  if (serviceName === "stripe") {
    return isServiceAvailable("stripe");
  }
  if (serviceName === "replicate") {
    return isServiceAvailable("replicate");
  }
  // Other services are optional
  return true;
}

/**
 * Check if test should be skipped due to unavailable service.
 */
export function shouldSkipTestForService(serviceName: string): boolean {
  const config = externalServicesConfig[serviceName];
  if (!config) {
    return false; // Unknown service, don't skip
  }
  if (!config.skipIfUnavailable) {
    return false; // Service doesn't require skipping
  }
  if (config.required && !isExternalServiceAvailable(serviceName)) {
    return true; // Required service unavailable, skip test
  }
  return false; // Optional service, don't skip
}

/**
 * Get skip reason for unavailable service.
 */
export function getSkipReason(serviceName: string): string {
  const config = externalServicesConfig[serviceName];
  if (!config) {
    return `Unknown service: ${serviceName}`;
  }
  return `${config.name} is not configured. Set ${serviceName.toUpperCase()}_SECRET_KEY or similar environment variable.`;
}

/**
 * Get external service configuration summary.
 */
export function getExternalServicesSummary(): string {
  const services = Object.entries(externalServicesConfig).map(([key, config]) => {
    const available = isExternalServiceAvailable(key);
    const status = available ? "AVAILABLE" : "UNAVAILABLE";
    const mode = config.useReal ? "REAL" : "STUBBED";
    return `  ${config.name} (${key}): ${status} [${mode}]`;
  });

  return `External Services Configuration:\n${services.join("\n")}`;
}

/**
 * Validate external services configuration.
 * Throws if required services are not available.
 */
export function validateExternalServices(): void {
  const missingRequired: string[] = [];

  for (const [key, config] of Object.entries(externalServicesConfig)) {
    if (config.required && !isExternalServiceAvailable(key)) {
      missingRequired.push(config.name);
    }
  }

  if (missingRequired.length > 0) {
    throw new Error(
      `Required external services are not available: ${missingRequired.join(", ")}\n` +
      `Please configure the required environment variables.`,
    );
  }
}

