import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { products, type Product } from "../data/products";
import { safeStorage } from "../utils/storage";
import { maxQuantity } from "../utils/catalog";
export type CartItem = { product: Product; quantity: number };
type CartStore = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (id: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getItemQuantity: (id: number) => number;
};
export function restoreCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const result: CartItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as { product?: { id?: unknown }; quantity?: unknown };
    const product = products.find((p) => p.id === item.product?.id);
    if (
      !product ||
      result.some((i) => i.product.id === product.id) ||
      typeof item.quantity !== "number" ||
      !Number.isFinite(item.quantity) ||
      item.quantity < 1
    )
      continue;
    result.push({
      product,
      quantity: Math.min(
        Math.max(1, maxQuantity(product)),
        Math.floor(item.quantity),
      ),
    });
  }
  return result;
}
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart(product, quantity = 1) {
        const current = products.find((p) => p.id === product.id);
        if (!current || !Number.isInteger(quantity) || quantity < 1)
          return false;
        const previous = get().getItemQuantity(current.id);
        if (previous + quantity > maxQuantity(current)) return false;
        set((s) => ({
          items: previous
            ? s.items.map((i) =>
                i.product.id === current.id
                  ? { product: current, quantity: i.quantity + quantity }
                  : i,
              )
            : [...s.items, { product: current, quantity }],
        }));
        return true;
      },
      removeFromCart: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.product.id !== id) })),
      setQuantity: (id, quantity) => {
        if (!Number.isInteger(quantity) || quantity < 1) return;
        set((s) => ({
          items: s.items.map((i) =>
            i.product.id === id && maxQuantity(i.product) > 0
              ? { ...i, quantity: Math.min(maxQuantity(i.product), quantity) }
              : i,
          ),
        }));
      },
      increaseQuantity: (id) =>
        get().setQuantity(id, get().getItemQuantity(id) + 1),
      decreaseQuantity: (id) =>
        get().setQuantity(id, get().getItemQuantity(id) - 1),
      clearCart: () => set({ items: [] }),
      getCartTotal: () =>
        get().items.reduce(
          (sum, i) =>
            sum +
            (maxQuantity(i.product) > 0 ? i.product.price * i.quantity : 0),
          0,
        ),
      getCartCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getItemQuantity: (id) =>
        get().items.find((i) => i.product.id === id)?.quantity ?? 0,
    }),
    {
      name: "joyneeds-cart",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ items: s.items }),
      merge: (persisted, current) => ({
        ...current,
        items: restoreCart((persisted as { items?: unknown } | null)?.items),
      }),
    },
  ),
);
