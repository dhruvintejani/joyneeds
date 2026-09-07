import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Deliberately log field names/messages only; never dump process.env.
  console.error("Invalid backend environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid backend environment configuration");
}

export const env = parsed.data;
