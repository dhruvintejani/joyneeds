import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma generation is a build-time operation and does not connect to a database.
// Migration, seed and Studio commands still require an explicitly supplied URL.
const databaseUrl = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim()
  || (process.argv.includes("generate") ? "postgresql://build:build@localhost:5432/build_only" : undefined);

if (!databaseUrl) {
  throw new Error("DATABASE_URL (or DIRECT_URL for migrations) is required for Prisma commands.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
