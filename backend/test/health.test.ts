import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import app from "../src/app.js";

test("GET /api/health returns a safe health response", async () => {
  const server = createServer(app);

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    assert.ok(address && typeof address === "object");

    const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    assert.equal(response.status, 200);

    const body = (await response.json()) as {
      data?: { status?: string; service?: string };
    };

    assert.equal(body.data?.status, "ok");
    assert.equal(body.data?.service, "joyneeds-api");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
