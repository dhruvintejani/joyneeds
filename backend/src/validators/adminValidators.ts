import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.");

const idSchema = z.string().trim().min(1).max(80);
const paiseSchema = z.coerce.number().int().min(0).max(100_000_000);
const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(200),
});
export type AdminLoginBody = z.infer<typeof adminLoginSchema>;

export const adminIdParamsSchema = z.object({ id: idSchema });
export type AdminIdParams = z.infer<typeof adminIdParamsSchema>;

export const adminProductImageParamsSchema = z.object({
  productId: idSchema,
  imageId: idSchema,
});
export type AdminProductImageParams = z.infer<typeof adminProductImageParamsSchema>;

export const adminProductListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  categoryId: idSchema.optional(),
  status: z.enum(["active", "inactive", "all"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
export type AdminProductListQuery = z.infer<typeof adminProductListQuerySchema>;

const adminProductInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: slugSchema.optional(),
  shortDescription: z.string().trim().min(2).max(500),
  description: z.string().trim().min(2).max(10_000),
  pricePaise: paiseSchema,
  originalPricePaise: paiseSchema.nullable().optional(),
  sku: z.string().trim().min(2).max(80),
  stockQuantity: z.coerce.number().int().min(0).max(1_000_000).nullable().optional(),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK"]).optional(),
  featured: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  active: z.boolean().optional(),
  categoryId: idSchema,
  subcategory: optionalText(120),
  features: z.array(z.string().trim().min(1).max(200)).max(30).optional(),
  specifications: z.record(z.string().trim().min(1).max(80), z.string().trim().max(500)).optional(),
  shippingInfo: optionalText(1000),
  returnInfo: optionalText(1000),
  tags: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
});

export const adminProductCreateSchema = adminProductInputSchema;
export type AdminProductCreateBody = z.infer<typeof adminProductCreateSchema>;

export const adminProductUpdateSchema = adminProductInputSchema.partial();
export type AdminProductUpdateBody = z.infer<typeof adminProductUpdateSchema>;

export const adminCategoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: slugSchema.optional(),
  description: optionalText(1000),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(10_000).optional(),
});
export type AdminCategoryCreateBody = z.infer<typeof adminCategoryCreateSchema>;

export const adminCategoryUpdateSchema = adminCategoryCreateSchema.partial();
export type AdminCategoryUpdateBody = z.infer<typeof adminCategoryUpdateSchema>;
