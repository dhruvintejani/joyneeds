import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { ProductListQuery } from "../validators/productValidators.js";

const publicProductSelect = {
  id: true,
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
  newArrival: true,
  subcategory: true,
  features: true,
  specifications: true,
  shippingInfo: true,
  returnInfo: true,
  tags: true,
  addedAt: true,
  category: {
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
    },
  },
  images: {
    select: {
      id: true,
      sourceUrl: true,
      secureUrl: true,
      altText: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: "asc" as const },
  },
} satisfies Prisma.ProductSelect;

export async function listProducts(query: ProductListQuery) {
  const where: Prisma.ProductWhereInput = { active: true };

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { shortDescription: { contains: query.q, mode: "insensitive" } },
      { subcategory: { contains: query.q, mode: "insensitive" } },
      { category: { name: { contains: query.q, mode: "insensitive" } } },
    ];
  }
  if (query.category) where.category = { slug: query.category, active: true };
  if (query.subcategory) where.subcategory = query.subcategory;
  if (query.inStock === true) where.stockStatus = "IN_STOCK";
  if (query.featured !== undefined) where.featured = query.featured;
  if (query.minPricePaise !== undefined || query.maxPricePaise !== undefined) {
    where.pricePaise = {
      ...(query.minPricePaise !== undefined ? { gte: query.minPricePaise } : {}),
      ...(query.maxPricePaise !== undefined ? { lte: query.maxPricePaise } : {}),
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    query.sort === "price-asc"
      ? [{ pricePaise: "asc" }, { name: "asc" }]
      : query.sort === "price-desc"
        ? [{ pricePaise: "desc" }, { name: "asc" }]
        : query.sort === "newest"
          ? [{ addedAt: "desc" }, { createdAt: "desc" }]
          : [{ featured: "desc" }, { createdAt: "desc" }];

  const skip = (query.page - 1) * query.limit;
  const [total, items] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: publicProductSelect,
      orderBy,
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

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: publicProductSelect,
  });

  if (!product) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  }

  return product;
}
