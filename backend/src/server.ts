import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const server = app.listen(env.PORT, () => {
  logger.info("JoyNeeds API started", {
    port: env.PORT,
    environment: env.NODE_ENV,
  });
});

function shutdown(signal: string) {
  logger.info("JoyNeeds API shutting down", { signal });
  server.close((error) => {
    if (error) {
      logger.error("JoyNeeds API shutdown failed", { errorName: error.name });
      process.exitCode = 1;
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
