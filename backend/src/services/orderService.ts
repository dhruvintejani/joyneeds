import { randomBytes } from "node:crypto";
import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { syncCustomerAccount } from "./accountService.js";
import type {
  AdminOrderListQuery,
  AdminOrderUpdateBody,
  CreateOrderBody,
} from "../validators/orderValidators.js";

const orderItemSelect = {
  id: true,
  productId: true,
  productName: true,
  sku: true,
  pricePaise: true,
  quantity: true,
  productImage: true,
} satisfies Prisma.OrderItemSelect;

const orderDetailSelect = {
  id: true,
  orderNumber: true,
  userId: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  subtotalPaise: true,
  shippingPaise: true,
  discountPaise: true,
  totalPaise: true,
  currency: true,
  status: true,
  courier: true,
  trackingNumber: true,
  trackingUrl: true,
  inventoryCommittedAt: true,
  shippedAt: true,
  deliveredAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
  items: { select: orderItemSelect },
  payments: {
    select: {
      id: true,
      provider: true,
      status: true,
      amountPaise: true,
      refundedAmountPaise: true,
      providerOrderId: true,
      providerPaymentId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.OrderSelect;

function orderNumber() {
  const date = new Date();
  const stamp = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
  return `JN-${stamp}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function createPendingOrder(body: CreateOrderBody, clerkUserId: string | null) {
  const requestedIds = body.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: requestedIds } },
    select: {
      id: true,
      name: true,
      sku: true,
      pricePaise: true,
      active: true,
      stockStatus: true,
      stockQuantity: true,
      images: {
        select: { sourceUrl: true, secureUrl: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  if (products.length !== requestedIds.length) {
    throw new AppError(409, "ORDER_PRODUCT_CHANGED", "One or more products are no longer available.");
  }

  const byId = new Map(products.map((product) => [product.id, product]));
  let subtotalPaise = 0;
  const items = body.items.map((item) => {
    const product = byId.get(item.productId);
    if (!product || !product.active || product.stockStatus !== "IN_STOCK") {
      throw new AppError(409, "ORDER_PRODUCT_UNAVAILABLE", "One or more products are unavailable.");
    }
    if (product.stockQuantity !== null && product.stockQuantity < item.quantity) {
      throw new AppError(
        409,
        "ORDER_STOCK_CHANGED",
        `${product.name} no longer has the requested quantity available.`,
      );
    }

    subtotalPaise += product.pricePaise * item.quantity;
    const image = product.images[0]?.secureUrl ?? product.images[0]?.sourceUrl ?? null;
    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      pricePaise: product.pricePaise,
      quantity: item.quantity,
      productImage: image,
    };
  });

  const user = clerkUserId ? await syncCustomerAccount(clerkUserId) : null;
  const shippingPaise = 0;
  const discountPaise = 0;
  const totalPaise = subtotalPaise + shippingPaise - discountPaise;

  const order = await prisma.order.create({
    data: {
      orderNumber: orderNumber(),
      userId: user?.id ?? null,
      customerName: body.customerName,
      customerEmail: body.customerEmail.trim().toLowerCase(),
      customerPhone: body.customerPhone,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2 || null,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      subtotalPaise,
      shippingPaise,
      discountPaise,
      totalPaise,
      items: { create: items },
    },
    select: orderDetailSelect,
  });

  return {
    ...order,
    paymentReady: false,
    inventoryReserved: false,
    note: "Payment is not enabled yet. Inventory is committed only when the order is confirmed.",
  };
}

export async function listCustomerOrders(clerkUserId: string) {
  const user = await syncCustomerAccount(clerkUserId);
  return prisma.order.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalPaise: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
      items: { select: orderItemSelect },
      payments: {
        select: { status: true, amountPaise: true, refundedAmountPaise: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomerOrder(clerkUserId: string, orderNumberValue: string) {
  const user = await syncCustomerAccount(clerkUserId);
  const order = await prisma.order.findFirst({
    where: { userId: user.id, orderNumber: orderNumberValue },
    select: orderDetailSelect,
  });
  if (!order) throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");
  return order;
}

export async function listAdminOrders(query: AdminOrderListQuery) {
  const where: Prisma.OrderWhereInput = {};
  if (query.status !== "ALL") where.status = query.status;
  if (query.q) {
    where.OR = [
      { orderNumber: { contains: query.q, mode: "insensitive" } },
      { customerName: { contains: query.q, mode: "insensitive" } },
      { customerEmail: { contains: query.q, mode: "insensitive" } },
      { customerPhone: { contains: query.q } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const [total, items] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        totalPaise: true,
        currency: true,
        status: true,
        inventoryCommittedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { items: true } },
        payments: {
          select: { status: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getAdminOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id }, select: orderDetailSelect });
  if (!order) throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");
  return order;
}

const transitions: Record<string, readonly string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

async function commitInventory(tx: Prisma.TransactionClient, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      inventoryCommittedAt: true,
      items: { select: { productId: true, productName: true, quantity: true } },
    },
  });
  if (!order) throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");
  if (order.inventoryCommittedAt) return;

  for (const item of order.items) {
    if (!item.productId) continue;
    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { id: true, active: true, stockStatus: true, stockQuantity: true },
    });
    if (!product || !product.active || product.stockStatus !== "IN_STOCK") {
      throw new AppError(409, "ORDER_STOCK_CHANGED", `${item.productName} is no longer available.`);
    }
    if (product.stockQuantity === null) continue;

    const updated = await tx.product.updateMany({
      where: {
        id: product.id,
        active: true,
        stockStatus: "IN_STOCK",
        stockQuantity: { gte: item.quantity },
      },
      data: { stockQuantity: { decrement: item.quantity } },
    });
    if (updated.count !== 1) {
      throw new AppError(409, "ORDER_STOCK_CHANGED", `${item.productName} no longer has enough stock.`);
    }
    await tx.product.updateMany({
      where: { id: product.id, stockQuantity: 0 },
      data: { stockStatus: "OUT_OF_STOCK" },
    });
  }

  await tx.order.update({
    where: { id: orderId },
    data: { inventoryCommittedAt: new Date() },
  });
}

async function releaseInventory(tx: Prisma.TransactionClient, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      inventoryCommittedAt: true,
      items: { select: { productId: true, quantity: true } },
    },
  });
  if (!order?.inventoryCommittedAt) return;

  for (const item of order.items) {
    if (!item.productId) continue;
    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { stockQuantity: true },
    });
    if (!product || product.stockQuantity === null) continue;
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stockQuantity: { increment: item.quantity },
        stockStatus: "IN_STOCK",
      },
    });
  }

  await tx.order.update({
    where: { id: orderId },
    data: { inventoryCommittedAt: null },
  });
}

export async function updateAdminOrder(id: string, body: AdminOrderUpdateBody) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        inventoryCommittedAt: true,
      },
    });
    if (!current) throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");

    if (body.status !== current.status) {
      const allowed = transitions[current.status] ?? [];
      if (!allowed.includes(body.status)) {
        throw new AppError(
          409,
          "INVALID_ORDER_TRANSITION",
          `Order cannot move from ${current.status} to ${body.status}.`,
        );
      }

      if (body.status === "CONFIRMED") await commitInventory(tx, id);
      if (body.status === "CANCELLED" && current.inventoryCommittedAt) await releaseInventory(tx, id);
    }

    const now = new Date();
    await tx.order.update({
      where: { id },
      data: {
        status: body.status,
        ...(body.courier !== undefined ? { courier: body.courier } : {}),
        ...(body.trackingNumber !== undefined ? { trackingNumber: body.trackingNumber } : {}),
        ...(body.trackingUrl !== undefined ? { trackingUrl: body.trackingUrl } : {}),
        ...(body.status === "SHIPPED" ? { shippedAt: now } : {}),
        ...(body.status === "DELIVERED" ? { deliveredAt: now } : {}),
        ...(body.status === "CANCELLED" ? { cancelledAt: now } : {}),
      },
    });

    const updated = await tx.order.findUnique({ where: { id }, select: orderDetailSelect });
    if (!updated) throw new AppError(404, "ORDER_NOT_FOUND", "Order not found.");
    return updated;
  });
}
