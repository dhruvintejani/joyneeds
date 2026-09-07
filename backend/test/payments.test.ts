import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import app from "../src/app.js";
import { env, razorpayConfigured } from "../src/config/env.js";
import { adminOrderUpdateSchema } from "../src/validators/orderValidators.js";

test("manual admin paid/refund states are rejected by validation", () => {
  assert.equal(adminOrderUpdateSchema.safeParse({ status: "CONFIRMED" }).success, false);
  assert.equal(adminOrderUpdateSchema.safeParse({ status: "REFUNDED" }).success, false);
  assert.equal(adminOrderUpdateSchema.safeParse({ status: "PROCESSING" }).success, true);
});

test(
  "Razorpay payment and raw webhook endpoints fail closed when credentials are absent",
  { skip: razorpayConfigured },
  async () => {
    const server = createServer(app);
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });

    try {
      const address = server.address();
      assert.ok(address && typeof address === "object");
      const base = `http://127.0.0.1:${address.port}`;

      const paymentResponse = await fetch(`${base}/api/payments/razorpay/order`, {
        method: "POST",
        headers: {
          Origin: env.FRONTEND_URL,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: "test-order-id" }),
      });
      assert.equal(paymentResponse.status, 503);
      const paymentBody = (await paymentResponse.json()) as { error?: { code?: string } };
      assert.equal(paymentBody.error?.code, "RAZORPAY_NOT_CONFIGURED");

      const webhookResponse = await fetch(`${base}/api/payments/razorpay/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": "0".repeat(64),
          "x-razorpay-event-id": "test-event-id",
        },
        body: JSON.stringify({ event: "payment.captured", payload: {} }),
      });
      assert.equal(webhookResponse.status, 503);
      const webhookBody = (await webhookResponse.json()) as { error?: { code?: string } };
      assert.equal(webhookBody.error?.code, "RAZORPAY_NOT_CONFIGURED");
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  },
);
