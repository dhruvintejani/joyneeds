import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import app from "../src/app.js";

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

test("catalog APIs expose the migrated JoyNeeds catalog", async () => {
  await withServer(async (baseUrl) => {
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
    assert.equal(categoriesResponse.status, 200);
    const categoriesBody = (await categoriesResponse.json()) as { data?: unknown[] };
    assert.equal(categoriesBody.data?.length, 6);

    const productsResponse = await fetch(`${baseUrl}/api/products?limit=5`);
    assert.equal(productsResponse.status, 200);
    const productsBody = (await productsResponse.json()) as {
      data?: { items?: Array<{ slug?: string; pricePaise?: number }>; pagination?: { total?: number } };
    };
    assert.equal(productsBody.data?.items?.length, 5);
    assert.equal(productsBody.data?.pagination?.total, 30);

    const productResponse = await fetch(`${baseUrl}/api/products/vegetable-chopper`);
    assert.equal(productResponse.status, 200);
    const productBody = (await productResponse.json()) as {
      data?: { slug?: string; pricePaise?: number; category?: { slug?: string } };
    };
    assert.equal(productBody.data?.slug, "vegetable-chopper");
    assert.equal(productBody.data?.pricePaise, 34_900);
    assert.equal(productBody.data?.category?.slug, "home-kitchen");

    const invalidResponse = await fetch(`${baseUrl}/api/products?page=0`);
    assert.equal(invalidResponse.status, 400);
  });
});
