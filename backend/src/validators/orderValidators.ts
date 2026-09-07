import { z } from "zod";

const idSchema = z.string().trim().min(1).max(80);
const quantitySchema = z.coerce.number().int().min(1).max(99);

export const orderItemSchema = z.object({
  productId: idSchema,
  quantity: quantitySchema,
});

export const createOrderSchema = z
  .object({
    customerName: z.string().trim().min(2).max(100),
    customerEmail: z.string().trim().email().max(254),
    customerPhone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number."),
    addressLine1: z.string().trim().min(5).max(250),
    addressLine2: z.string().trim().max(250).nullable().optional(),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid PIN code."),
    items: z.array(orderItemSchema).min(1).max(50),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();
    value.items.forEach((item, index) => {
      if (seen.has(item.productId)) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "productId"],
          message: "Duplicate products are not allowed in an order.",
        });
      }
      seen.add(item.productId);
    });
  });

export type CreateOrderBody = z.infer<typeof createOrderSchema>;

export const customerOrderParamsSchema = z.object({
  orderNumber: z.string().trim().min(4).max(80),
});
export type CustomerOrderParams = z.infer<typeof customerOrderParamsSchema>;

export const cartSyncSchema = z
  .object({
    items: z.array(orderItemSchema).max(50),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();
    value.items.forEach((item, index) => {
      if (seen.has(item.productId)) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "productId"],
          message: "Duplicate cart products are not allowed.",
        });
      }
      seen.add(item.productId);
    });
  });
export type CartSyncBody = z.infer<typeof cartSyncSchema>;

export const adminOrderListQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z
    .enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED", "ALL"])
    .default("ALL"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;

export const adminOrderParamsSchema = z.object({ id: idSchema });
export type AdminOrderParams = z.infer<typeof adminOrderParamsSchema>;

export const adminOrderUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  courier: z.string().trim().max(120).nullable().optional(),
  trackingNumber: z.string().trim().max(160).nullable().optional(),
  trackingUrl: z.string().url().max(1000).nullable().optional(),
});
export type AdminOrderUpdateBody = z.infer<typeof adminOrderUpdateSchema>;
