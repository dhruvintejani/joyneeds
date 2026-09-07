import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import type {
  AdminCategoryCreateBody,
  AdminCategoryUpdateBody,
  AdminProductCreateBody,
  AdminProductListQuery,
  AdminProductUpdateBody,
} from "../validators/adminValidators.js";

const adminProductSelect = {
  id: true,
  legacyId: true,
  slug: true,
  name: true,
  shortDescription: true,
  description: true,
  pricePaise: true,
  originalPricePaise: true,
  sku: true,
  stockQuantity: true,
  stockStatus: true,
  featured: true,
  bestseller: true,
  newArrival: true,
  active: true,
  categoryId: true,
  subcategory: true,
  features: true,
  specifications: true,
  shippingInfo: true,
  returnInfo: true,
  tags: true,
  addedAt: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true, active: true } },
  images: {
    select: {
      id: true,
      sourceUrl: true,
      secureUrl: true,
      publicId: true,
      altText: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: "asc" as const },
  },
} satisfies Prisma.ProductSelect;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function knownPrismaCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  return String((error as { code?: unknown }).code ?? "");
}

function translateWriteError(error: unknown, entity: "product" | "category"): never {
  const code = knownPrismaCode(error);
  if (code === "P2002") {
    throw new AppError(409, `${entity.toUpperCase()}_CONFLICT`, `${entity === "product" ? "Product" : "Category"} slug, name, or SKU already exists.`);
  }
  if (code === "P2025") {
    throw new AppError(404, `${entity.toUpperCase()}_NOT_FOUND`, `${entity === "product" ? "Product" : "Category"} not found.`);
  }
  throw error;
}

function validatePrices(pricePaise: number, originalPricePaise?: number | null) {
  if (originalPricePaise !== undefined && originalPricePaise !== null && originalPricePaise < pricePaise) {
    throw new AppError(400, "INVALID_PRICE", "Original price cannot be lower than the selling price.");
  }
}

async function ensureActiveCategory(categoryId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, active: true }, select: { id: true } });
  if (!category) throw new AppError(400, "INVALID_CATEGORY", "Select an active category.");
}

export async function getAdminDashboard() {
  const [totalProducts, activeProducts, outOfStockProducts, categories, orders, customers, paidPayments] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true, stockStatus: "OUT_OF_STOCK" } }),
    prisma.category.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.payment.findMany({
      where: { status: { in: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"] } },
      select: { amountPaise: true, refundedAmountPaise: true },
    }),
  ]);

  const netRevenuePaise = paidPayments.reduce(
    (sum, payment) => sum + Math.max(0, payment.amountPaise - payment.refundedAmountPaise),
    0,
  );

  return { totalProducts, activeProducts, outOfStockProducts, categories, orders, customers, netRevenuePaise };
}

export async function listAdminProducts(query: AdminProductListQuery) {
  const where: Prisma.ProductWhereInput = {};
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { sku: { contains: query.q, mode: "insensitive" } },
      { slug: { contains: query.q, mode: "insensitive" } },
    ];
  }
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.status === "active") where.active = true;
  if (query.status === "inactive") where.active = false;

  const skip = (query.page - 1) * query.limit;
  const [total, items] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: adminProductSelect,
      orderBy: [{ updatedAt: "desc" }],
      skip,
      take: query.limit,
    }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function createAdminProduct(body: AdminProductCreateBody) {
  await ensureActiveCategory(body.categoryId);
  validatePrices(body.pricePaise, body.originalPricePaise);

  const slug = body.slug || slugify(body.name);
  if (!slug) throw new AppError(400, "INVALID_SLUG", "A valid product slug is required.");

  const stockStatus = body.stockStatus ?? (body.stockQuantity === 0 ? "OUT_OF_STOCK" : "IN_STOCK");

  try {
    return await prisma.product.create({
      data: {
        slug,
        name: body.name,
        shortDescription: body.shortDescription,
        description: body.description,
        pricePaise: body.pricePaise,
        originalPricePaise: body.originalPricePaise ?? null,
        sku: body.sku,
        stockQuantity: body.stockQuantity ?? null,
        stockStatus,
        featured: body.featured ?? false,
        newArrival: body.newArrival ?? false,
        active: body.active ?? true,
        categoryId: body.categoryId,
        subcategory: body.subcategory ?? null,
        features: body.features ?? [],
        ...(body.specifications !== undefined ? { specifications: body.specifications } : {}),
        shippingInfo: body.shippingInfo ?? null,
        returnInfo: body.returnInfo ?? null,
        tags: body.tags ?? [],
        addedAt: body.newArrival ? new Date() : null,
        ...(body.images?.length
          ? {
              images: {
                create: body.images.map((image, sortOrder) => ({
                  sourceUrl: image.url,
                  altText: image.altText || body.name,
                  sortOrder,
                })),
              },
            }
          : {}),
      },
      select: adminProductSelect,
    });
  } catch (error) {
    translateWriteError(error, "product");
  }
}

export async function updateAdminProduct(id: string, body: AdminProductUpdateBody) {
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true, name: true, pricePaise: true, originalPricePaise: true, stockStatus: true, addedAt: true } });
  if (!existing) throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  if (body.categoryId) await ensureActiveCategory(body.categoryId);

  const nextPrice = body.pricePaise ?? existing.pricePaise;
  const nextOriginal = body.originalPricePaise === undefined ? existing.originalPricePaise : body.originalPricePaise;
  validatePrices(nextPrice, nextOriginal);

  const data: Prisma.ProductUpdateInput = {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.slug !== undefined ? { slug: body.slug } : {}),
    ...(body.shortDescription !== undefined ? { shortDescription: body.shortDescription } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.pricePaise !== undefined ? { pricePaise: body.pricePaise } : {}),
    ...(body.originalPricePaise !== undefined ? { originalPricePaise: body.originalPricePaise } : {}),
    ...(body.sku !== undefined ? { sku: body.sku } : {}),
    ...(body.stockQuantity !== undefined ? { stockQuantity: body.stockQuantity } : {}),
    ...(body.stockStatus !== undefined
      ? { stockStatus: body.stockStatus }
      : body.stockQuantity !== undefined
        ? { stockStatus: body.stockQuantity === 0 ? "OUT_OF_STOCK" : "IN_STOCK" }
        : {}),
    ...(body.featured !== undefined ? { featured: body.featured } : {}),
    ...(body.newArrival !== undefined
      ? { newArrival: body.newArrival, addedAt: body.newArrival ? existing.addedAt ?? new Date() : null }
      : {}),
    ...(body.active !== undefined ? { active: body.active } : {}),
    ...(body.categoryId !== undefined ? { category: { connect: { id: body.categoryId } } } : {}),
    ...(body.subcategory !== undefined ? { subcategory: body.subcategory } : {}),
    ...(body.features !== undefined ? { features: body.features } : {}),
    ...(body.specifications !== undefined ? { specifications: body.specifications } : {}),
    ...(body.shippingInfo !== undefined ? { shippingInfo: body.shippingInfo } : {}),
    ...(body.returnInfo !== undefined ? { returnInfo: body.returnInfo } : {}),
    ...(body.tags !== undefined ? { tags: body.tags } : {}),
  };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });
      if (body.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (body.images.length) {
          await tx.productImage.createMany({
            data: body.images.map((image, sortOrder) => ({
              productId: id,
              sourceUrl: image.url,
              altText: image.altText || body.name || existing.name,
              sortOrder,
            })),
          });
        }
      }
    });

    return await prisma.product.findUniqueOrThrow({ where: { id }, select: adminProductSelect });
  } catch (error) {
    translateWriteError(error, "product");
  }
}

export async function archiveAdminProduct(id: string) {
  try {
    return await prisma.product.update({
      where: { id },
      data: { active: false, stockStatus: "OUT_OF_STOCK" },
      select: { id: true, active: true, stockStatus: true },
    });
  } catch (error) {
    translateWriteError(error, "product");
  }
}

export async function listAdminCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      active: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { products: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createAdminCategory(body: AdminCategoryCreateBody) {
  const slug = body.slug || slugify(body.name);
  if (!slug) throw new AppError(400, "INVALID_SLUG", "A valid category slug is required.");

  try {
    return await prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description ?? null,
        active: body.active ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });
  } catch (error) {
    translateWriteError(error, "category");
  }
}

export async function updateAdminCategory(id: string, body: AdminCategoryUpdateBody) {
  try {
    return await prisma.category.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.slug !== undefined ? { slug: body.slug } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
      },
    });
  } catch (error) {
    translateWriteError(error, "category");
  }
}

export async function archiveAdminCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, _count: { select: { products: { where: { active: true } } } } },
  });
  if (!category) throw new AppError(404, "CATEGORY_NOT_FOUND", "Category not found.");
  if (category._count.products > 0) {
    throw new AppError(409, "CATEGORY_IN_USE", "Move or archive active products before archiving this category.");
  }
  return prisma.category.update({ where: { id }, data: { active: false } });
}
