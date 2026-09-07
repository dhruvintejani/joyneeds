import { z } from "zod";

const optionalBoolean = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

export const productListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    q: z.string().trim().max(100).optional(),
    category: z.string().trim().min(1).max(120).optional(),
    subcategory: z.string().trim().min(1).max(120).optional(),
    minPricePaise: z.coerce.number().int().min(0).optional(),
    maxPricePaise: z.coerce.number().int().min(0).optional(),
    inStock: optionalBoolean,
    featured: optionalBoolean,
    sort: z.enum(["featured", "price-asc", "price-desc", "newest"]).default("featured"),
  })
  .superRefine((value, ctx) => {
    if (
      value.minPricePaise !== undefined &&
      value.maxPricePaise !== undefined &&
      value.minPricePaise > value.maxPricePaise
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["maxPricePaise"],
        message: "maxPricePaise must be greater than or equal to minPricePaise",
      });
    }
  });

export const productSlugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type ProductSlugParams = z.infer<typeof productSlugParamsSchema>;
