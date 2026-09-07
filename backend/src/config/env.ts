import "dotenv/config";
import { z } from "zod";

const optionalSecret = z.string().trim().min(1).optional();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    FRONTEND_URL: z.string().url().default("http://localhost:5173"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    CLERK_PUBLISHABLE_KEY: optionalSecret,
    CLERK_SECRET_KEY: optionalSecret,
  })
  .superRefine((value, ctx) => {
    const hasPublishable = Boolean(value.CLERK_PUBLISHABLE_KEY);
    const hasSecret = Boolean(value.CLERK_SECRET_KEY);
    if (hasPublishable !== hasSecret) {
      ctx.addIssue({
        code: "custom",
        path: [hasPublishable ? "CLERK_SECRET_KEY" : "CLERK_PUBLISHABLE_KEY"],
        message: "Clerk publishable and secret keys must be configured together.",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid backend environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid backend environment configuration");
}

export const env = parsed.data;
export const clerkConfigured = Boolean(env.CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY);
