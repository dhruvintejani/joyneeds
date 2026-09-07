import type { Category, Product } from "../types/catalog";

const configuredApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
export const apiBaseUrl = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, "")
  : import.meta.env.DEV
    ? "http://localhost:4000"
    : "";

export class CatalogApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "CatalogApiError";
  }
}

type ApiCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
};

type ApiProductImage = {
  id: string;
  sourceUrl: string | null;
  secureUrl: string | null;
  altText: string | null;
  sortOrder: number;
};

type ApiProduct = {
  id: string;
  legacyId: number | null;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  pricePaise: number;
  originalPricePaise: number | null;
  sku: string;
  stockQuantity: number | null;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";
  featured: boolean;
  newArrival: boolean;
  subcategory: string | null;
  features: unknown;
  specifications: unknown;
  shippingInfo: string;
  returnInfo: string;
  tags: unknown;
  addedAt: string | null;
  category: ApiCategory;
  images: ApiProductImage[];
};

type ApiListResponse = {
  data: {
    items: ApiProduct[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
};

type ApiProductResponse = { data: ApiProduct };
type ApiCategoryResponse = { data: ApiCategory[] };

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asStringRecord(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );
  return entries.length ? Object.fromEntries(entries) : undefined;
}

export function normalizeProduct(product: ApiProduct): Product {
  const images = product.images
    .map((image) => image.secureUrl || image.sourceUrl)
    .filter((value): value is string => !!value);
  const price = product.pricePaise / 100;
  const originalPrice =
    product.originalPricePaise === null ? null : product.originalPricePaise / 100;

  return {
    id: product.id,
    legacyId: product.legacyId,
    slug: product.slug,
    name: product.name,
    category: product.category.name,
    categorySlug: product.category.slug,
    price,
    originalPrice,
    discountPercentage:
      originalPrice && originalPrice > price
        ? Math.round((1 - price / originalPrice) * 100)
        : 0,
    image: images[0] || "/brand/joyneeds-icon.png",
    images,
    shortDescription: product.shortDescription,
    fullDescription: product.description,
    features: asStringArray(product.features),
    specifications: asStringRecord(product.specifications),
    subcategory: product.subcategory || undefined,
    stockQuantity: product.stockQuantity,
    newArrival: product.newArrival,
    addedAt: product.addedAt || undefined,
    rating: null,
    reviewCount: 0,
    featured: product.featured,
    bestseller: false,
    stockStatus:
      product.stockStatus === "IN_STOCK" ? "in_stock" : "out_of_stock",
    sku: product.sku,
    shippingInfo: product.shippingInfo,
    returnInfo: product.returnInfo,
    tags: asStringArray(product.tags),
  };
}

async function requestJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (!apiBaseUrl) {
    throw new CatalogApiError(
      "The catalog API is not configured for this deployment. Set VITE_API_URL to the backend origin.",
    );
  }

  let response: Response;
  try {
    response = await fetch(apiBaseUrl + path, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new CatalogApiError("Unable to reach the JoyNeeds catalog service.");
  }

  if (!response.ok) {
    let message = "The catalog service returned an unexpected response.";
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body.error?.message) message = body.error.message;
    } catch {
      // Keep the safe generic message for non-JSON failures.
    }
    throw new CatalogApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export async function fetchAllProducts(signal?: AbortSignal): Promise<Product[]> {
  const products: Product[] = [];
  let page = 1;
  let pages = 1;

  do {
    const response = await requestJson<ApiListResponse>(
      `/api/products?page=${page}&limit=50`,
      signal,
    );
    products.push(...response.data.items.map(normalizeProduct));
    pages = response.data.pagination.pages;
    page += 1;
  } while (page <= pages);

  return products;
}

export async function fetchProductBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<Product> {
  const response = await requestJson<ApiProductResponse>(
    `/api/products/${encodeURIComponent(slug)}`,
    signal,
  );
  return normalizeProduct(response.data);
}

export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const response = await requestJson<ApiCategoryResponse>("/api/categories", signal);
  return response.data;
}
