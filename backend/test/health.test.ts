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

test("GET /api/health returns a safe liveness response", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/health`);
    assert.equal(response.status, 200);

    const body = (await response.json()) as {
      data?: { status?: string; service?: string };
    };
    assert.equal(body.data?.status, "ok");
    assert.equal(body.data?.service, "joyneeds-api");
  });
});

test("GET /api/health/ready confirms database readiness", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/health/ready`);
    assert.equal(response.status, 200);

    const body = (await response.json()) as {
      data?: { status?: string; service?: string; database?: string };
    };
    assert.equal(body.data?.status, "ready");
    assert.equal(body.data?.service, "joyneeds-api");
    assert.equal(body.data?.database, "ok");
  });
});
