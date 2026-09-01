import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../data/products";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getItemQuantity: (productId: number) => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product: Product) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        });
      },

      removeFromCart: (productId: number) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      increaseQuantity: (productId: number) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }));
      },

      decreaseQuantity: (productId: number) => {
        set((state) => ({
          items: state.items
            .map((i) =>
              i.product.id === productId
                ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                : i
            ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getItemQuantity: (productId: number) => {
        const item = get().items.find((i) => i.product.id === productId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: "joyneeds-cart",
    }
  )
);
