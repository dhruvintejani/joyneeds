import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Product } from "../types/catalog";
import { safeStorage } from "../utils/storage";
import { maxQuantity } from "../utils/catalog";

export type CartItem = { product: Product; quantity: number };
export type ServerCartItem = { productId: string; quantity: number };

type CartStore = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  reconcileCatalog: (products: Product[]) => void;
  mergeServerCart: (serverItems: ServerCartItem[], products: Product[]) => CartItem[];
  getCartTotal: () => number;
  getCartCount: () => number;
  getItemQuantity: (id: string) => number;
};

const stringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

function restoreProduct(value: unknown): Product | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const numericLegacy =
    typeof raw.id === "number" && Number.isInteger(raw.id) ? raw.id : null;
  const legacyId =
    typeof raw.legacyId === "number" && Number.isInteger(raw.legacyId)
      ? raw.legacyId
      : numericLegacy;
  const id =
    typeof raw.id === "string" && raw.id.trim()
      ? raw.id
      : legacyId !== null
        ? `legacy:${legacyId}`
        : null;

  if (
    !id ||
    typeof raw.slug !== "string" ||
    typeof raw.name !== "string" ||
    typeof raw.category !== "string" ||
    typeof raw.price !== "number" ||
    !Number.isFinite(raw.price) ||
    raw.price < 0 ||
    typeof raw.image !== "string" ||
    typeof raw.shortDescription !== "string"
  ) {
    return null;
  }

  return {
    id,
    legacyId,
    slug: raw.slug,
    name: raw.name,
    category: raw.category,
    categorySlug: typeof raw.categorySlug === "string" ? raw.categorySlug : "",
    price: raw.price,
    originalPrice:
      typeof raw.originalPrice === "number" && Number.isFinite(raw.originalPrice)
        ? raw.originalPrice
        : null,
    discountPercentage:
      typeof raw.discountPercentage === "number" &&
      Number.isFinite(raw.discountPercentage)
        ? raw.discountPercentage
        : 0,
    image: raw.image,
    images: stringArray(raw.images),
    shortDescription: raw.shortDescription,
    ...(typeof raw.fullDescription === "string"
      ? { fullDescription: raw.fullDescription }
      : {}),
    features: stringArray(raw.features),
    ...(raw.specifications && typeof raw.specifications === "object"
      ? { specifications: raw.specifications as Record<string, string> }
      : {}),
    ...(typeof raw.subcategory === "string" ? { subcategory: raw.subcategory } : {}),
    stockQuantity:
      typeof raw.stockQuantity === "number" && Number.isFinite(raw.stockQuantity)
        ? raw.stockQuantity
        : null,
    newArrival: raw.newArrival === true,
    ...(typeof raw.addedAt === "string" ? { addedAt: raw.addedAt } : {}),
    rating:
      typeof raw.rating === "number" && Number.isFinite(raw.rating)
        ? raw.rating
        : null,
    reviewCount:
      typeof raw.reviewCount === "number" && Number.isFinite(raw.reviewCount)
        ? Math.max(0, Math.floor(raw.reviewCount))
        : 0,
    featured: raw.featured === true,
    bestseller: raw.bestseller === true,
    stockStatus: raw.stockStatus === "out_of_stock" ? "out_of_stock" : "in_stock",
    sku: typeof raw.sku === "string" ? raw.sku : "",
    shippingInfo: typeof raw.shippingInfo === "string" ? raw.shippingInfo : "",
    returnInfo: typeof raw.returnInfo === "string" ? raw.returnInfo : "",
    tags: stringArray(raw.tags),
  };
}

export function restoreCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const result: CartItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as { product?: unknown; quantity?: unknown };
    const product = restoreProduct(item.product);
    if (
      !product ||
      result.some((existing) => existing.product.slug === product.slug) ||
      typeof item.quantity !== "number" ||
      !Number.isFinite(item.quantity) ||
      item.quantity < 1
    ) {
      continue;
    }
    result.push({ product, quantity: Math.min(99, Math.floor(item.quantity)) });
  }
  return result;
}

export function reconcileCart(items: CartItem[], products: Product[]): CartItem[] {
  const result: CartItem[] = [];
  for (const item of items) {
    const current = products.find(
      (product) =>
        product.id === item.product.id ||
        (item.product.legacyId !== null &&
          product.legacyId === item.product.legacyId) ||
        product.slug === item.product.slug,
    );
    if (!current || result.some((existing) => existing.product.id === current.id)) {
      continue;
    }
    const limit = maxQuantity(current);
    result.push({
      product: current,
      quantity: limit > 0 ? Math.min(limit, Math.max(1, item.quantity)) : 1,
    });
  }
  return result;
}

export function mergeServerCart(
  localItems: CartItem[],
  serverItems: ServerCartItem[],
  products: Product[],
): CartItem[] {
  const local = reconcileCart(localItems, products);
  const quantities = new Map(local.map((item) => [item.product.id, item.quantity]));
  for (const item of serverItems) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) continue;
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) continue;
    const limit = maxQuantity(product);
    if (limit < 1) continue;
    const previous = quantities.get(product.id) ?? 0;
    quantities.set(product.id, Math.min(limit, Math.max(previous, item.quantity)));
  }
  return products
    .filter((product) => quantities.has(product.id))
    .map((product) => ({ product, quantity: quantities.get(product.id)! }));
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart(product, quantity = 1) {
        if (!Number.isInteger(quantity) || quantity < 1) return false;
        const limit = maxQuantity(product);
        if (limit < 1) return false;
        const previous = get().getItemQuantity(product.id);
        if (previous + quantity > limit) return false;
        set((state) => ({
          items: previous
            ? state.items.map((item) =>
                item.product.id === product.id
                  ? { product, quantity: item.quantity + quantity }
                  : item,
              )
            : [...state.items, { product, quantity }],
        }));
        return true;
      },
      removeFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== id),
        })),
      setQuantity: (id, quantity) => {
        if (!Number.isInteger(quantity) || quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === id && maxQuantity(item.product) > 0
              ? {
                  ...item,
                  quantity: Math.min(maxQuantity(item.product), quantity),
                }
              : item,
          ),
        }));
      },
      increaseQuantity: (id) =>
        get().setQuantity(id, get().getItemQuantity(id) + 1),
      decreaseQuantity: (id) =>
        get().setQuantity(id, get().getItemQuantity(id) - 1),
      clearCart: () => set({ items: [] }),
      reconcileCatalog: (products) =>
        set((state) => ({ items: reconcileCart(state.items, products) })),
      mergeServerCart: (serverItems, products) => {
        const merged = mergeServerCart(get().items, serverItems, products);
        set({ items: merged });
        return merged;
      },
      getCartTotal: () =>
        get().items.reduce(
          (sum, item) =>
            sum +
            (maxQuantity(item.product) > 0
              ? item.product.price * item.quantity
              : 0),
          0,
        ),
      getCartCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
      getItemQuantity: (id) =>
        get().items.find((item) => item.product.id === id)?.quantity ?? 0,
    }),
    {
      name: "joyneeds-cart",
      version: 3,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => ({
        ...current,
        items: restoreCart((persisted as { items?: unknown } | null)?.items),
      }),
    },
  ),
);
