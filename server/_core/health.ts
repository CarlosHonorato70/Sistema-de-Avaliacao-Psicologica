/**
 * Health Check Endpoint
 * 
 * Provides system health status for monitoring and load balancers.
 * Checks critical services like database connectivity.
 */

import { Request, Response } from "express";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: {
      status: "up" | "down";
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
  };
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<{
  status: "up" | "down";
  responseTime?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    const db = await getDb();
    
    // Note: getDb() can return null if DATABASE_URL is not configured or if
    // the database connection failed to initialize. This is by design to allow
    // local tooling to run without a database. In production, this should always
    // be configured, and the health check will properly report the unhealthy state.
    if (!db) {
      return {
        status: "down",
        error: "Database connection not initialized",
      };
    }
    
    // Simple query to check database connection
    await db.execute(sql`SELECT 1`);
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: "up",
      responseTime,
    };
  } catch (error) {
    return {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

/**
 * Get memory usage statistics
 */
function getMemoryUsage() {
  const usage = process.memoryUsage();
  const total = usage.heapTotal;
  const used = usage.heapUsed;
  
  return {
    used: Math.round(used / 1024 / 1024), // MB
    total: Math.round(total / 1024 / 1024), // MB
    percentage: Math.round((used / total) * 100),
  };
}

/**
 * Get CPU usage (simplified)
 */
function getCPUUsage() {
  const usage = process.cpuUsage();
  const totalUsage = (usage.user + usage.system) / 1000000; // Convert to seconds
  const uptime = process.uptime();
  
  return {
    usage: Math.round((totalUsage / uptime) * 100),
  };
}

/**
 * Determine overall health status
 */
function determineStatus(checks: HealthStatus["checks"]): HealthStatus["status"] {
  // Unhealthy if database is down
  if (checks.database.status === "down") {
    return "unhealthy";
  }
  
  // Degraded if memory usage is very high
  if (checks.memory.percentage > 90) {
    return "degraded";
  }
  
  // Degraded if database response time is slow
  if (checks.database.responseTime && checks.database.responseTime > 1000) {
    return "degraded";
  }
  
  return "healthy";
}

/**
 * Health check endpoint handler
 */
export async function healthCheckHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const databaseCheck = await checkDatabase();
    const memoryUsage = getMemoryUsage();
    const cpuUsage = getCPUUsage();
    
    const checks = {
      database: databaseCheck,
      memory: memoryUsage,
      cpu: cpuUsage,
    };
    
    const status = determineStatus(checks);
    
    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      checks,
    };
    
    // Set appropriate HTTP status code
    const httpStatus = status === "healthy" ? 200 : status === "degraded" ? 200 : 503;
    
    res.status(httpStatus).json(healthStatus);
  } catch (error) {
    // If health check itself fails, return unhealthy
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      error: error instanceof Error ? error.message : "Health check failed",
      checks: {
        database: { status: "down", error: "Health check error" },
        memory: getMemoryUsage(),
        cpu: getCPUUsage(),
      },
    });
  }
}

/**
 * Simple liveness probe (for Kubernetes/Docker)
 * Just checks if the process is running
 */
export function livenessHandler(req: Request, res: Response): void {
  res.status(200).json({ status: "alive" });
}

/**
 * Readiness probe (for Kubernetes/Docker)
 * Checks if the app is ready to serve traffic
 */
export async function readinessHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const dbCheck = await checkDatabase();
    
    if (dbCheck.status === "up") {
      res.status(200).json({ status: "ready" });
    } else {
      res.status(503).json({ status: "not ready", reason: "database unavailable" });
    }
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      reason: error instanceof Error ? error.message : "unknown error",
    });
  }
}
