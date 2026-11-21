import { create } from "zustand";
import { fetchAllProducts, fetchCategories } from "../api/catalog";
import type { Category, Product } from "../types/catalog";
import { useCartStore } from "./cartStore";
import { useDiscoveryStore } from "./discoveryStore";

import { products as seedProducts, categories as seedCategories, categoryToSlug, categoryDescriptions } from "../data/products";

type CatalogStatus = "idle" | "loading" | "ready" | "preview" | "error";

// Local catalog is for browsing only; the server must supply actual prices and availability for checkout.
const previewCategories: Category[] = seedCategories.map((name, sortOrder) => ({ id: `preview-${categoryToSlug[name]}`, slug: categoryToSlug[name], name, description: categoryDescriptions[name] || "", sortOrder }));
const previewProducts: Product[] = seedProducts.map((product) => ({ ...product, id: `preview-${product.id}`, legacyId: product.id, categorySlug: categoryToSlug[product.category], images: product.images?.length ? product.images : [product.image], stockQuantity: product.stockQuantity ?? null, rating: null, reviewCount: 0, bestseller: false }));

type CatalogStore = {
  products: Product[];
  categories: Category[];
  status: CatalogStatus;
  error: string | null;
  loadCatalog: (force?: boolean) => Promise<void>;
};

let pendingLoad: Promise<void> | null = null;

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  products: [],
  categories: [],
  status: "idle",
  error: null,
  async loadCatalog(force = false) {
    if (!force && get().status === "ready") return;
    if (!force && pendingLoad) return pendingLoad;

    set({ status: "loading", error: null });
    pendingLoad = Promise.all([fetchAllProducts(), fetchCategories()])
      .then(([products, categories]) => {
        useCartStore.getState().reconcileCatalog(products);
        useDiscoveryStore.getState().reconcileCatalog(products);
        set({ products, categories, status: "ready", error: null });
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load the JoyNeeds catalog.";
        // Do not replace an already loaded live catalog with sample data after a transient failure.
        if (get().products.length && !get().products[0].id.startsWith("preview-")) {
          set({ status: "error", error: message });
          return;
        }
        useCartStore.getState().reconcileCatalog(previewProducts);
        useDiscoveryStore.getState().reconcileCatalog(previewProducts);
        set({ products: previewProducts, categories: previewCategories, status: "preview", error: message });
      })
      .finally(() => {
        pendingLoad = null;
      });

    return pendingLoad;
  },
}));
