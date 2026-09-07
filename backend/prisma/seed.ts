import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client.js";
import {
  categories,
  categoryDescriptions,
  categoryToSlug,
  products,
} from "./legacy-products.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to seed JoyNeeds.");

const adapter = new PrismaPg({ connectionString: databaseUrl, connectionTimeoutMillis: 5_000 });
const prisma = new PrismaClient({ adapter });

const toPaise = (rupees: number) => Math.round(rupees * 100);

const safeDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dedupe = (values: string[]) => [...new Set(values.filter(Boolean))];

async function main() {
  await prisma.$transaction(async (tx) => {
    for (const [sortOrder, name] of categories.entries()) {
      const slug = categoryToSlug[name];
      if (!slug) throw new Error(`Missing category slug for ${name}`);

      await tx.category.upsert({
        where: { slug },
        update: {
          name,
          description: categoryDescriptions[name] ?? null,
          active: true,
          sortOrder,
        },
        create: {
          slug,
          name,
          description: categoryDescriptions[name] ?? null,
          active: true,
          sortOrder,
        },
      });
    }

    const categoryRows = await tx.category.findMany({
      where: { slug: { in: categories.map((name) => categoryToSlug[name]!).filter(Boolean) } },
    });
    const categoryIdByName = new Map(categoryRows.map((row) => [row.name, row.id]));

    for (const product of products) {
      const categoryId = categoryIdByName.get(product.category);
      if (!categoryId) throw new Error(`Category not seeded for product ${product.slug}`);

      const data = {
        legacyId: product.id,
        slug: product.slug,
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.fullDescription || product.shortDescription,
        pricePaise: toPaise(product.price),
        originalPricePaise:
          typeof product.originalPrice === "number" ? toPaise(product.originalPrice) : null,
        sku: product.sku,
        stockQuantity:
          typeof product.stockQuantity === "number"
            ? Math.max(0, Math.floor(product.stockQuantity))
            : null,
        stockStatus: product.stockStatus === "out_of_stock" ? "OUT_OF_STOCK" as const : "IN_STOCK" as const,
        featured: product.featured,
        bestseller: product.bestseller,
        newArrival: product.newArrival ?? false,
        active: true,
        categoryId,
        subcategory: product.subcategory ?? null,
        features: product.features,
        specifications: product.specifications ?? Prisma.JsonNull,
        shippingInfo: product.shippingInfo || null,
        returnInfo: product.returnInfo || null,
        tags: product.tags,
        addedAt: safeDate(product.addedAt),
      };

      const row = await tx.product.upsert({
        where: { slug: product.slug },
        update: data,
        create: data,
      });

      const imageUrls = dedupe([product.image, ...(product.images ?? [])]);
      await tx.productImage.deleteMany({ where: { productId: row.id } });
      if (imageUrls.length) {
        await tx.productImage.createMany({
          data: imageUrls.map((sourceUrl, sortOrder) => ({
            productId: row.id,
            sourceUrl,
            altText: product.name,
            sortOrder,
          })),
        });
      }
    }
  });

  const [productCount, categoryCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
  ]);

  console.log(`Seeded JoyNeeds catalog: ${productCount} products, ${categoryCount} categories.`);
}

main()
  .catch((error: unknown) => {
    console.error("JoyNeeds seed failed:", error instanceof Error ? error.message : "Unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
