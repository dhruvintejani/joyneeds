import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { products } from "../data/products";
import { safeStorage } from "../utils/storage";

const cleanIds = (value: unknown): number[] =>
  Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (id): id is number =>
              typeof id === "number" && products.some((p) => p.id === id),
          ),
        ),
      ]
    : [];
type Discovery = {
  wishlist: number[];
  recent: number[];
  toggleWishlist: (id: number) => void;
  view: (id: number) => void;
};
export const useDiscoveryStore = create<Discovery>()(
  persist(
    (set) => ({
      wishlist: [],
      recent: [],
      toggleWishlist: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id)
            ? s.wishlist.filter((x) => x !== id)
            : cleanIds([...s.wishlist, id]),
        })),
      view: (id) =>
        set((s) => ({
          recent: cleanIds([id, ...s.recent.filter((x) => x !== id)]).slice(
            0,
            8,
          ),
        })),
    }),
    {
      name: "joyneeds-discovery",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ wishlist: s.wishlist, recent: s.recent }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<Discovery> | null;
        return {
          ...current,
          wishlist: cleanIds(saved?.wishlist),
          recent: cleanIds(saved?.recent).slice(0, 8),
        };
      },
    },
  ),
);
