import assert from "node:assert/strict";
import test from "node:test";
import { prisma } from "../src/config/prisma.js";
import { createPendingOrder, updateAdminOrder } from "../src/services/orderService.js";

test("orders use database prices and commit/release known inventory safely", async () => {
  const product = await prisma.product.findFirst({
    where: { active: true },
    orderBy: { legacyId: "asc" },
    select: {
      id: true,
      name: true,
      pricePaise: true,
      stockQuantity: true,
      stockStatus: true,
      active: true,
    },
  });
  assert.ok(product, "seeded product is required");

  let orderId: string | null = null;
  try {
    await prisma.product.update({
      where: { id: product.id },
      data: { stockQuantity: 5, stockStatus: "IN_STOCK", active: true },
    });

    const order = await createPendingOrder(
      {
        customerName: "Phase Six Test",
        customerEmail: "phase6@example.com",
        customerPhone: "9000000000",
        addressLine1: "10 Test Street",
        addressLine2: null,
        city: "Test City",
        state: "Gujarat",
        postalCode: "380001",
        items: [{ productId: product.id, quantity: 2 }],
      },
      null,
    );
    orderId = order.id;

    assert.equal(order.subtotalPaise, product.pricePaise * 2);
    assert.equal(order.totalPaise, product.pricePaise * 2);
    assert.equal(order.status, "PENDING");
    assert.equal(order.inventoryCommittedAt, null);

    const beforeConfirm = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
      select: { stockQuantity: true },
    });
    assert.equal(beforeConfirm.stockQuantity, 5, "pending orders must not consume stock");

    const confirmed = await updateAdminOrder(order.id, { status: "CONFIRMED" });
    assert.equal(confirmed.status, "CONFIRMED");
    assert.ok(confirmed.inventoryCommittedAt);
    const afterConfirm = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
      select: { stockQuantity: true },
    });
    assert.equal(afterConfirm.stockQuantity, 3);

    const cancelled = await updateAdminOrder(order.id, { status: "CANCELLED" });
    assert.equal(cancelled.status, "CANCELLED");
    assert.equal(cancelled.inventoryCommittedAt, null);
    const afterCancel = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
      select: { stockQuantity: true },
    });
    assert.equal(afterCancel.stockQuantity, 5, "cancelling before shipment restores committed stock");
  } finally {
    if (orderId) await prisma.order.delete({ where: { id: orderId } }).catch(() => undefined);
    await prisma.product.update({
      where: { id: product.id },
      data: {
        stockQuantity: product.stockQuantity,
        stockStatus: product.stockStatus,
        active: product.active,
      },
    });
  }
});
