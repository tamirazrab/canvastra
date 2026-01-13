/**
 * Unified Logger Utility
 *
 * Provides structured logging that works in both client and server environments.
 * - Server-side: Uses Pino for fast, structured JSON logging
 * - Client-side: Uses console with structured format
 * - Development: Pretty-printed logs for readability
 * - Production: JSON logs for parsing and analysis
 */

import pino from "pino";

const isServer = typeof window === "undefined";
const isDevelopment = process.env.NODE_ENV === "development";

// Server-side logger with Pino
let serverLogger: pino.Logger | null = null;

function getServerLogger(): pino.Logger {
  if (!serverLogger) {
    const options: pino.LoggerOptions = {
      level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
    };

    // Use plain JSON format to avoid worker thread issues in Next.js/Turbopack
    // pino-pretty transport uses worker threads which don't work with bundlers
    // For pretty logs in development, pipe output through pino-pretty externally:
    // NODE_ENV=development node server.js | pino-pretty
    serverLogger = pino(options);
  }
  return serverLogger;
}

// Client-side logger with structured console output
function createClientLogger() {
  const logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || "debug";
  const levels = ["debug", "info", "warn", "error"] as const;
  const currentLevelIndex = levels.indexOf(
    (logLevel as (typeof levels)[number]) || "info",
  );

  const formatMessage = (
    level: string,
    message: string,
    data?: Record<string, unknown>,
  ) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return { prefix, message, data, timestamp };
  };

  return {
    debug: (message: string, data?: Record<string, unknown>) => {
      if (currentLevelIndex <= levels.indexOf("debug")) {
        const formatted = formatMessage("debug", message, data);
        if (isDevelopment) {
          console.debug(
            `${formatted.prefix} ${formatted.message}`,
            formatted.data || "",
          );
        } else {
          console.debug(JSON.stringify(formatted));
        }
      }
    },
    info: (message: string, data?: Record<string, unknown>) => {
      if (currentLevelIndex <= levels.indexOf("info")) {
        const formatted = formatMessage("info", message, data);
        if (isDevelopment) {
          console.info(
            `${formatted.prefix} ${formatted.message}`,
            formatted.data || "",
          );
        } else {
          console.info(JSON.stringify(formatted));
        }
      }
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      if (currentLevelIndex <= levels.indexOf("warn")) {
        const formatted = formatMessage("warn", message, data);
        if (isDevelopment) {
          console.warn(
            `${formatted.prefix} ${formatted.message}`,
            formatted.data || "",
          );
        } else {
          console.warn(JSON.stringify(formatted));
        }
      }
    },
    error: (
      message: string,
      error?: Error | unknown,
      data?: Record<string, unknown>,
    ) => {
      if (currentLevelIndex <= levels.indexOf("error")) {
        const formatted = formatMessage("error", message, {
          ...data,
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                  name: error.name,
                }
              : error,
        });
        if (isDevelopment) {
          console.error(
            `${formatted.prefix} ${formatted.message}`,
            formatted.data || "",
          );
        } else {
          console.error(JSON.stringify(formatted));
        }
      }
    },
  };
}

// Export unified logger interface
export type Logger = {
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (
    message: string,
    error?: Error | unknown,
    data?: Record<string, unknown>,
  ) => void;
};

// Create and export logger instance
let loggerInstance: Logger;

if (isServer) {
  const pinoLogger = getServerLogger();
  loggerInstance = {
    debug: (message: string, data?: Record<string, unknown>) => {
      pinoLogger.debug(data || {}, message);
    },
    info: (message: string, data?: Record<string, unknown>) => {
      pinoLogger.info(data || {}, message);
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      pinoLogger.warn(data || {}, message);
    },
    error: (
      message: string,
      error?: Error | unknown,
      data?: Record<string, unknown>,
    ) => {
      const errorData = {
        ...data,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error,
      };
      pinoLogger.error(errorData, message);
    },
  };
} else {
  loggerInstance = createClientLogger();
}

export const logger = loggerInstance;

// Helper to create child logger with context
export function createLogger(context: Record<string, unknown>): Logger {
  if (isServer) {
    const pinoLogger = getServerLogger().child(context);
    return {
      debug: (message: string, data?: Record<string, unknown>) => {
        pinoLogger.debug(data || {}, message);
      },
      info: (message: string, data?: Record<string, unknown>) => {
        pinoLogger.info(data || {}, message);
      },
      warn: (message: string, data?: Record<string, unknown>) => {
        pinoLogger.warn(data || {}, message);
      },
      error: (
        message: string,
        error?: Error | unknown,
        data?: Record<string, unknown>,
      ) => {
        const errorData = {
          ...data,
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                  name: error.name,
                }
              : error,
        };
        pinoLogger.error(errorData, message);
      },
    };
  }

  const clientLogger = createClientLogger();
  return {
    debug: (message: string, data?: Record<string, unknown>) => {
      clientLogger.debug(message, { ...context, ...data });
    },
    info: (message: string, data?: Record<string, unknown>) => {
      clientLogger.info(message, { ...context, ...data });
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      clientLogger.warn(message, { ...context, ...data });
    },
    error: (
      message: string,
      error?: Error | unknown,
      data?: Record<string, unknown>,
    ) => {
      clientLogger.error(message, error, { ...context, ...data });
    },
  };
}
