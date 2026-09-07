import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Product } from "../types/catalog";
import { safeStorage } from "../utils/storage";

type StoredKey = string | number;

const cleanKeys = (value: unknown): StoredKey[] =>
  Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (id): id is StoredKey =>
              (typeof id === "string" && id.trim().length > 0) ||
              (typeof id === "number" && Number.isInteger(id) && id > 0),
          ),
        ),
      ]
    : [];

function reconcileKeys(keys: StoredKey[], products: Product[]): string[] {
  const result: string[] = [];
  for (const key of keys) {
    const legacy =
      typeof key === "number"
        ? key
        : key.startsWith("legacy:")
          ? Number(key.slice(7))
          : null;
    const product = products.find(
      (item) => item.id === key || (legacy !== null && item.legacyId === legacy),
    );
    if (product && !result.includes(product.id)) result.push(product.id);
  }
  return result;
}

type Discovery = {
  wishlist: StoredKey[];
  recent: StoredKey[];
  toggleWishlist: (id: string) => void;
  view: (id: string) => void;
  reconcileCatalog: (products: Product[]) => void;
};

export const useDiscoveryStore = create<Discovery>()(
  persist(
    (set) => ({
      wishlist: [],
      recent: [],
      toggleWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.includes(id)
            ? state.wishlist.filter((item) => item !== id)
            : [...state.wishlist, id],
        })),
      view: (id) =>
        set((state) => ({
          recent: [id, ...state.recent.filter((item) => item !== id)].slice(0, 8),
        })),
      reconcileCatalog: (products) =>
        set((state) => ({
          wishlist: reconcileKeys(state.wishlist, products),
          recent: reconcileKeys(state.recent, products).slice(0, 8),
        })),
    }),
    {
      name: "joyneeds-discovery",
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        wishlist: state.wishlist,
        recent: state.recent,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<Discovery> | null;
        return {
          ...current,
          wishlist: cleanKeys(saved?.wishlist),
          recent: cleanKeys(saved?.recent).slice(0, 8),
        };
      },
    },
  ),
);
