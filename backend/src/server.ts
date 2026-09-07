import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { logger } from "./utils/logger.js";

const server = app.listen(env.PORT, () => {
  logger.info("JoyNeeds API started", {
    port: env.PORT,
    environment: env.NODE_ENV,
  });
});

server.requestTimeout = 30_000;
server.headersTimeout = 35_000;
server.keepAliveTimeout = 5_000;

let shuttingDown = false;

function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("JoyNeeds API shutting down", { signal });

  const forceExitTimer = setTimeout(() => {
    logger.error("JoyNeeds API forced shutdown after timeout", { signal });
    process.exit(1);
  }, 15_000);
  forceExitTimer.unref();

  server.close(async (error) => {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      logger.error("Prisma disconnect failed during shutdown", {
        errorName: disconnectError instanceof Error ? disconnectError.name : "UnknownError",
      });
      process.exitCode = 1;
    }

    clearTimeout(forceExitTimer);
    if (error) {
      logger.error("JoyNeeds API shutdown failed", { errorName: error.name });
      process.exitCode = 1;
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
