import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import app from "../src/app.js";
import { adminAuthConfigured, configuredPaymentProvider, env, orderCreationEnabled } from "../src/config/env.js";

test("checkout capability reflects server settings and customer records require admin authentication", async () => {
  const server = createServer(app);
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  try {
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const base = "http://127.0.0.1:" + address.port;
    const response = await fetch(base + "/api/health/features");
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json() as { data: unknown }).data, { checkoutEnabled: orderCreationEnabled && configuredPaymentProvider, paymentProvider: env.PAYMENT_PROVIDER });
    for (const path of ["/api/admin/customers", "/api/admin/customers/example"]) {
      const denied = await fetch(base + path);
      assert.equal(denied.status, adminAuthConfigured ? 401 : 503);
    }
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});
