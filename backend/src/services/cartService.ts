import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { syncCustomerAccount } from "./accountService.js";
import type { CartSyncBody } from "../validators/orderValidators.js";

export async function getCustomerCart(clerkUserId: string) {
  const user = await syncCustomerAccount(clerkUserId);
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    select: {
      items: {
        select: { productId: true, quantity: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return { items: cart?.items ?? [] };
}

export async function syncCustomerCart(clerkUserId: string, body: CartSyncBody) {
  const user = await syncCustomerAccount(clerkUserId);
  const ids = body.items.map((item) => item.productId);
  const products = ids.length
    ? await prisma.product.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          active: true,
          stockStatus: true,
          stockQuantity: true,
          name: true,
        },
      })
    : [];

  if (products.length !== ids.length) {
    throw new AppError(409, "CART_PRODUCT_CHANGED", "One or more cart products no longer exist.");
  }

  const productsById = new Map(products.map((product) => [product.id, product]));
  for (const item of body.items) {
    const product = productsById.get(item.productId);
    if (!product || !product.active || product.stockStatus !== "IN_STOCK") {
      throw new AppError(409, "CART_PRODUCT_UNAVAILABLE", "One or more cart products are unavailable.");
    }
    if (product.stockQuantity !== null && item.quantity > product.stockQuantity) {
      throw new AppError(
        409,
        "CART_STOCK_CHANGED",
        `${product.name} no longer has the requested quantity available.`,
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
      select: { id: true },
    });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    if (body.items.length) {
      await tx.cartItem.createMany({
        data: body.items.map((item) => ({
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
    }
    const items = await tx.cartItem.findMany({
      where: { cartId: cart.id },
      select: { productId: true, quantity: true },
      orderBy: { createdAt: "asc" },
    });
    return { items };
  });
}
