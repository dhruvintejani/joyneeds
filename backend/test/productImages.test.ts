import assert from "node:assert/strict";
import test from "node:test";
import { cloudinaryConfigured } from "../src/config/env.js";
import { prisma } from "../src/config/prisma.js";
import { addProductImages, listProductImages } from "../src/services/productImageService.js";
import { AppError } from "../src/utils/AppError.js";

test("existing seeded product images remain readable before Cloudinary replacement", async () => {
  const product = await prisma.product.findFirst({
    where: { images: { some: {} } },
    select: { id: true },
  });
  assert.ok(product, "expected the seeded catalog to contain at least one product image");

  const images = await listProductImages(product.id);
  assert.ok(images.length > 0);
  assert.ok(images.some((image) => Boolean(image.sourceUrl || image.secureUrl)));
});

test(
  "Cloudinary image writes fail closed when credentials are not configured",
  { skip: cloudinaryConfigured },
  async () => {
    await assert.rejects(
      () => addProductImages("not-used", []),
      (error: unknown) => {
        assert.ok(error instanceof AppError);
        assert.equal(error.statusCode, 503);
        assert.equal(error.code, "CLOUDINARY_NOT_CONFIGURED");
        return true;
      },
    );
  },
);
