import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import app from "../src/app.js";
import { adminAuthConfigured, env } from "../src/config/env.js";

test(
  "admin session and login fail closed when dedicated admin auth is not configured",
  { skip: adminAuthConfigured },
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

      const sessionResponse = await fetch(`${base}/api/admin/auth/session`);
      assert.equal(sessionResponse.status, 503);
      const sessionBody = (await sessionResponse.json()) as { error?: { code?: string } };
      assert.equal(sessionBody.error?.code, "ADMIN_AUTH_NOT_CONFIGURED");

      const loginResponse = await fetch(`${base}/api/admin/auth/login`, {
        method: "POST",
        headers: {
          Origin: env.FRONTEND_URL,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "admin@example.com", password: "not-a-real-password" }),
      });
      assert.equal(loginResponse.status, 503);
      const loginBody = (await loginResponse.json()) as { error?: { code?: string } };
      assert.equal(loginBody.error?.code, "ADMIN_AUTH_NOT_CONFIGURED");
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  },
);
