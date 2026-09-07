import { prisma } from "../config/prisma.js";

export type HealthStatus = {
  status: "ok";
  service: "joyneeds-api";
  timestamp: string;
};

export type ReadinessStatus = {
  status: "ready" | "unavailable";
  service: "joyneeds-api";
  database: "ok" | "unavailable";
  timestamp: string;
};

export function getHealthStatus(): HealthStatus {
  return {
    status: "ok",
    service: "joyneeds-api",
    timestamp: new Date().toISOString(),
  };
}

export async function getReadinessStatus(): Promise<ReadinessStatus> {
  const timestamp = new Date().toISOString();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: "ready",
      service: "joyneeds-api",
      database: "ok",
      timestamp,
    };
  } catch {
    return {
      status: "unavailable",
      service: "joyneeds-api",
      database: "unavailable",
      timestamp,
    };
  }
}
