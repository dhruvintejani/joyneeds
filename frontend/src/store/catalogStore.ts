import { create } from "zustand";
import { fetchAllProducts, fetchCategories } from "../api/catalog";
import type { Category, Product } from "../types/catalog";
import { useCartStore } from "./cartStore";
import { useDiscoveryStore } from "./discoveryStore";

type CatalogStatus = "idle" | "loading" | "ready" | "error";

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
        set({ status: "error", error: message });
      })
      .finally(() => {
        pendingLoad = null;
      });

    return pendingLoad;
  },
}));
