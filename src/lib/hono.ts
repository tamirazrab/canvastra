import { hc } from "hono/client";
import { logger, createLogger } from "@/lib/logger";

import { AppType } from "@/app/api/[[...route]]/route";

const clientLogger = createLogger({ context: "hono-client" });

// Create the base client with validated URL
// In client components, use window.location.origin as fallback
// In server components, env validation ensures NEXT_PUBLIC_APP_URL exists
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // Client-side: use current origin or env var
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
  // Server-side: use env var directly (NEXT_PUBLIC_* vars are available on server too)
  // We don't need to import the validated env here since NEXT_PUBLIC_APP_URL
  // is safe to use directly (it's a public env var)
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

const baseURL = getBaseURL();
const baseClient = hc<AppType>(baseURL);

// Wrap the client to add logging
const createLoggedClient = (): typeof baseClient => {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Create a proxy to intercept API calls
  return new Proxy(baseClient as object, {
    get(target, prop) {
      const value = target[prop as keyof typeof target];

      // If it's the api property, wrap it
      if (prop === "api") {
        return new Proxy(value, {
          get(apiTarget, apiProp) {
            const apiValue = apiTarget[apiProp as keyof typeof apiTarget];

            // If it's a route with HTTP methods, wrap those
            if (apiValue && typeof apiValue === "object") {
              return new Proxy(apiValue, {
                get(routeTarget, routeProp) {
                  const routeValue =
                    routeTarget[routeProp as keyof typeof routeTarget];

                  // Intercept HTTP methods ($get, $post, $patch, $delete)
                  if (
                    typeof routeProp === "string" &&
                    routeProp.startsWith("$") &&
                    typeof routeValue === "function"
                  ) {
                    return async (...args: unknown[]) => {
                      const method = routeProp.toUpperCase().replace("$", "");
                      const path = String(apiProp);
                      const startTime = Date.now();
                      const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                      // Extract request data
                      let requestData: unknown;
                      if (args.length > 0 && typeof args[0] === "object") {
                        requestData = args[0];
                      }

                      // Sanitize sensitive data for logging
                      const sanitizeData = (data: unknown): unknown => {
                        if (!data || typeof data !== "object") return data;
                        const sanitized = { ...data } as Record<
                          string,
                          unknown
                        >;
                        if ("password" in sanitized) {
                          sanitized.password = "[REDACTED]";
                        }
                        if (
                          "json" in sanitized &&
                          typeof sanitized.json === "object"
                        ) {
                          sanitized.json = sanitizeData(sanitized.json);
                        }
                        return sanitized;
                      };

                      const sanitizedRequestData = sanitizeData(requestData);

                      clientLogger.info("API request initiated", {
                        requestId,
                        method,
                        path,
                        url: `${baseURL}${path}`,
                        ...(isDevelopment && { data: sanitizedRequestData }),
                      });

                      try {
                        // Add timeout to request (30 seconds default)
                        const timeoutMs = 30000; // 30 seconds
                        const timeoutPromise = new Promise<never>(
                          (_, reject) => {
                            setTimeout(() => {
                              reject(
                                new Error(
                                  `Request timeout after ${timeoutMs}ms`,
                                ),
                              );
                            }, timeoutMs);
                          },
                        );

                        // Race between the actual request and timeout
                        // Type assertion needed because Proxy loses type information
                        const routeFn = routeValue as (...args: unknown[]) => Promise<Response>;
                        const response = await Promise.race([
                          routeFn(...args),
                          timeoutPromise,
                        ]);

                        const duration = Date.now() - startTime;

                        // Try to extract response data
                        let responseData: unknown;
                        let status: number | undefined;

                        if (response && typeof response === "object") {
                          if ("ok" in response) {
                            status = response.ok
                              ? 200
                              : (response as { status?: number }).status || 500;
                            try {
                              // Clone response to read body without consuming it
                              const clonedResponse = response.clone();
                              const contentType =
                                clonedResponse.headers.get("content-type");
                              if (contentType?.includes("application/json")) {
                                responseData = await clonedResponse
                                  .json()
                                  .catch(() => undefined);
                              } else {
                                responseData = await clonedResponse
                                  .text()
                                  .catch(() => undefined);
                              }
                            } catch {
                              // Ignore body reading errors
                            }
                          } else if ("status" in response && typeof (response as any).status === "number") {
                            status = (response as any).status;
                          }
                        }

                        if (status && status >= 400) {
                          clientLogger.error(
                            "API request failed",
                            new Error(`HTTP ${status}`),
                            {
                              requestId,
                              method,
                              path,
                              status,
                              duration: `${duration}ms`,
                              ...(isDevelopment && { responseData }),
                            },
                          );
                        } else {
                          clientLogger.info("API request completed", {
                            requestId,
                            method,
                            path,
                            status: status || "unknown",
                            duration: `${duration}ms`,
                            ...(isDevelopment && { responseData }),
                          });
                        }

                        return response;
                      } catch (error) {
                        const duration = Date.now() - startTime;
                        clientLogger.error("API request error", error, {
                          requestId,
                          method,
                          path,
                          duration: `${duration}ms`,
                          ...(isDevelopment && {
                            requestData: sanitizedRequestData,
                          }),
                        });
                        throw error;
                      }
                    };
                  }

                  return routeValue;
                },
              });
            }

            return apiValue;
          },
        });
      }

      return value;
    },
  });
};

export const client = createLoggedClient();
