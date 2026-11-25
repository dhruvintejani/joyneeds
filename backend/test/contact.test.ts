import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import app from "../src/app.js";
import { contactSchema } from "../src/routes/contactRoutes.js";
import { env, brevoConfigured } from "../src/config/env.js";
test("contact validator rejects incomplete and oversized enquiries", () => {
  assert.equal(contactSchema.safeParse({ name: "Tester", email: "invalid", message: "a".repeat(20) }).success, false);
  assert.equal(contactSchema.safeParse({ name: "Tester", email: "test@example.com", message: "a".repeat(2001) }).success, false);
  assert.equal(contactSchema.safeParse({ name: "Tester", email: "test@example.com", message: "A valid contact message" }).success, true);
});
test("contact capability reflects configuration without exposing credentials", async () => {
  const server = createServer(app);
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  try {
    const addr = server.address(); assert.ok(addr && typeof addr === "object");
    const base = "http://127.0.0.1:" + addr.port + "/api/contact";
    const response = await fetch(base);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { data: { enabled: brevoConfigured && Boolean(env.CONTACT_RECIPIENT_EMAIL) } });
    const denied = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    assert.equal(denied.status, 403);
    if (!brevoConfigured || !env.CONTACT_RECIPIENT_EMAIL) {
      const unconfigured = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json", Origin: env.FRONTEND_URL }, body: JSON.stringify({ name: "Test User", email: "test@example.com", message: "A test message that is never sent" }) });
      assert.equal(unconfigured.status, 503);
    }
  } finally { await new Promise<void>((resolve,reject) => server.close(error => error ? reject(error) : resolve())); }
});
