import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import app from "../src/app.js";
import { clerkConfigured } from "../src/config/env.js";

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const server = createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    assert.ok(address && typeof address === "object");
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("admin APIs remain fail closed until dedicated Phase 5 admin auth", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/session`);
    assert.equal(response.status, 503);
    const body = (await response.json()) as { error?: { code?: string } };
    assert.equal(body.error?.code, "ADMIN_AUTH_NOT_CONFIGURED");
  });
});

test(
  "customer account API runs in guest-only mode when Clerk is not configured",
  { skip: clerkConfigured },
  async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/account`);
      assert.equal(response.status, 503);
      const body = (await response.json()) as { error?: { code?: string } };
      assert.equal(body.error?.code, "CUSTOMER_AUTH_NOT_CONFIGURED");
    });
  },
);
