import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import app from "../src/app.js";
import { clerkConfigured } from "../src/config/env.js";

test(
  "admin APIs fail closed when Clerk is not configured",
  { skip: clerkConfigured },
  async () => {
    const server = createServer(app);
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });

    try {
      const address = server.address();
      assert.ok(address && typeof address === "object");
      const response = await fetch(`http://127.0.0.1:${address.port}/api/admin/session`);
      assert.equal(response.status, 503);
      const body = (await response.json()) as { error?: { code?: string } };
      assert.equal(body.error?.code, "ADMIN_AUTH_NOT_CONFIGURED");
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  },
);
