import type { Product } from "../types/catalog";
import { site } from "../config/site";

export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const maxQuantity = (product: Product) =>
  product.stockStatus === "out_of_stock"
    ? 0
    : Math.min(
        99,
        Math.max(0, Math.floor(product.stockQuantity ?? 99)),
      );

export const discount = (product: Product) =>
  site.catalogVerified &&
  product.originalPrice &&
  product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

export const matchesSearch = (product: Product, query: string) =>
  query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .every((word) =>
      [
        product.name,
        product.category,
        product.subcategory,
        product.shortDescription,
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(word),
    );

export const sortOptions = {
  featured: "Featured",
  popular: "Popular",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Rating",
  discount: "Discount",
  newest: "Newest",
};

export type SortOption = keyof typeof sortOptions;

export function selectProducts(
  products: Product[],
  params: URLSearchParams,
  category?: string,
) {
  const numeric = (key: string, fallback: number) => {
    const raw = params.get(key);
    const value = raw === null || raw.trim() === "" ? fallback : Number(raw);
    return Number.isFinite(value) ? Math.max(0, value) : fallback;
  };
  const q = params.get("q") || params.get("search") || "";
  const cat = category || params.get("category");
  const min = numeric("min", 0);
  const max = numeric("max", Infinity);
  const result = products.filter(
    (product) =>
      (!cat || product.category === cat) &&
      matchesSearch(product, q) &&
      (!params.get("subcategory") ||
        product.subcategory === params.get("subcategory")) &&
      product.price >= min &&
      product.price <= max &&
      (!params.has("rating") ||
        !site.catalogVerified ||
        (product.rating ?? 0) >= numeric("rating", 0)) &&
      (!params.has("discount") ||
        !site.catalogVerified ||
        discount(product) >= numeric("discount", 0)) &&
      (params.get("stock") !== "1" || maxQuantity(product) > 0) &&
      (params.get("featured") !== "1" || product.featured) &&
      (params.get("new") !== "1" || product.newArrival),
  );

  switch (params.get("sort")) {
    case "price-asc":
      return result.sort((a, b) => a.price - b.price);
    case "price-desc":
      return result.sort((a, b) => b.price - a.price);
    case "rating":
      return site.catalogVerified
        ? result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        : result.sort((a, b) => Number(b.featured) - Number(a.featured));
    case "popular":
      return site.catalogVerified
        ? result.sort((a, b) => Number(b.bestseller) - Number(a.bestseller))
        : result.sort((a, b) => Number(b.featured) - Number(a.featured));
    case "discount":
      return site.catalogVerified
        ? result.sort((a, b) => discount(b) - discount(a))
        : result.sort((a, b) => Number(b.featured) - Number(a.featured));
    case "newest":
      return result.sort((a, b) =>
        (b.addedAt || "").localeCompare(a.addedAt || ""),
      );
    default:
      return result.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}
