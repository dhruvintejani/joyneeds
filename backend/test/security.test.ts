import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import app from "../src/app.js";

async function withServer(run: (origin: string) => Promise<void>) {
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

test("API sends baseline security headers", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/health`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
    assert.ok(response.headers.get("content-security-policy"));
  });
});

test("CORS rejects an unapproved browser origin", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/health`, {
      headers: { Origin: "https://untrusted.example" },
    });
    assert.equal(response.status, 403);
    const body = (await response.json()) as { error?: { code?: string } };
    assert.equal(body.error?.code, "CORS_ORIGIN_DENIED");
  });
});

test("malformed JSON returns a safe 400 response", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{\"items\":",
    });
    assert.equal(response.status, 400);
    const body = (await response.json()) as { error?: { code?: string } };
    assert.equal(body.error?.code, "INVALID_JSON");
  });
});

test("oversized JSON returns 413 without processing the route", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: "x".repeat(1_100_000) }),
    });
    assert.equal(response.status, 413);
    const body = (await response.json()) as { error?: { code?: string } };
    assert.equal(body.error?.code, "BODY_TOO_LARGE");
  });
});
