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
    ADMIN_EMAIL: z.string().trim().toLowerCase().email().optional(),
    ADMIN_PASSWORD_HASH: optionalSecret,
    ADMIN_SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(12),
    ORDER_CREATION_ENABLED: z.enum(["true", "false"]).default("false"),
    CLOUDINARY_CLOUD_NAME: optionalSecret,
    CLOUDINARY_API_KEY: optionalSecret,
    CLOUDINARY_API_SECRET: optionalSecret,
    CLOUDINARY_FOLDER: z.string().trim().min(1).max(120).default("joyneeds/products"),
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

    const hasAdminEmail = Boolean(value.ADMIN_EMAIL);
    const hasAdminHash = Boolean(value.ADMIN_PASSWORD_HASH);
    if (hasAdminEmail !== hasAdminHash) {
      ctx.addIssue({
        code: "custom",
        path: [hasAdminEmail ? "ADMIN_PASSWORD_HASH" : "ADMIN_EMAIL"],
        message: "Admin email and password hash must be configured together.",
      });
    }

    const cloudinaryValues = [
      value.CLOUDINARY_CLOUD_NAME,
      value.CLOUDINARY_API_KEY,
      value.CLOUDINARY_API_SECRET,
    ];
    const cloudinaryConfiguredCount = cloudinaryValues.filter(Boolean).length;
    if (cloudinaryConfiguredCount > 0 && cloudinaryConfiguredCount < cloudinaryValues.length) {
      ctx.addIssue({
        code: "custom",
        path: ["CLOUDINARY_CLOUD_NAME"],
        message: "Cloudinary cloud name, API key and API secret must be configured together.",
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
export const adminAuthConfigured = Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH);
export const orderCreationEnabled = env.ORDER_CREATION_ENABLED === "true";
export const cloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);
