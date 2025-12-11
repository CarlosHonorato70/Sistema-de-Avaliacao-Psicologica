/**
 * Structured Logger
 * 
 * Provides consistent, structured logging across the application.
 * In production, logs are formatted as JSON for easy parsing by
 * monitoring tools like Sentry, Datadog, or CloudWatch.
 */

type LogLevel = "error" | "warn" | "info" | "debug" | "trace";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private minLevel: LogLevel;
  private isProduction: boolean;
  private useJsonFormat: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
    this.minLevel = this.getMinLevel();
    this.useJsonFormat = this.isProduction || process.env.LOG_FORMAT === "json";
  }

  private getMinLevel(): LogLevel {
    const configuredLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    const validLevels: LogLevel[] = ["error", "warn", "info", "debug", "trace"];
    
    if (configuredLevel && validLevels.includes(configuredLevel)) {
      return configuredLevel;
    }
    
    return this.isProduction ? "info" : "debug";
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["error", "warn", "info", "debug", "trace"];
    const minLevelIndex = levels.indexOf(this.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex <= minLevelIndex;
  }

  private formatLog(entry: LogEntry): string {
    if (this.useJsonFormat) {
      return JSON.stringify(entry);
    }

    // Pretty format for development
    const emoji = {
      error: "❌",
      warn: "⚠️ ",
      info: "ℹ️ ",
      debug: "🔍",
      trace: "🔬",
    }[entry.level];

    let output = `${emoji} [${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\n   Context: ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.error) {
      output += `\n   Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack && !this.isProduction) {
        output += `\n   Stack: ${entry.error.stack}`;
      }
    }

    return output;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    const formattedLog = this.formatLog(entry);

    // Use appropriate console method
    switch (level) {
      case "error":
        console.error(formattedLog);
        break;
      case "warn":
        console.warn(formattedLog);
        break;
      default:
        console.log(formattedLog);
    }
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log("error", message, context, error);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  /**
   * Log a trace message (very verbose, only for deep debugging)
   */
  trace(message: string, context?: LogContext): void {
    this.log("trace", message, context);
  }

  /**
   * Create a child logger with additional context
   */
  child(defaultContext: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);
    
    childLogger.log = (level: LogLevel, message: string, context?: LogContext, error?: Error) => {
      const mergedContext = { ...defaultContext, ...context };
      originalLog(level, message, mergedContext, error);
    };
    
    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  error: (message: string, error?: Error, context?: LogContext) => 
    logger.error(message, error, context),
  warn: (message: string, context?: LogContext) => 
    logger.warn(message, context),
  info: (message: string, context?: LogContext) => 
    logger.info(message, context),
  debug: (message: string, context?: LogContext) => 
    logger.debug(message, context),
  trace: (message: string, context?: LogContext) => 
    logger.trace(message, context),
};

// Express middleware for request logging
export function requestLogger() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Log request
    logger.debug("Incoming request", {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    });

    // Log response
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 400 ? "warn" : "info";

      logger[level]("Request completed", {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  };
}
