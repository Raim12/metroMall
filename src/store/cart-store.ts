"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product, ProductColor } from "@/types";

interface CartState {
  items: CartItem[];
  /** Controls the slide-out Sheet in the navbar. */
  isOpen: boolean;
  /** Guards against rendering persisted counts before hydration. */
  hasHydrated: boolean;

  addItem: (
    product: Product,
    options: { size: string; color: ProductColor; quantity?: number },
  ) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  clear: () => void;

  openCart: () => void;
  closeCart: () => void;
  setOpen: (open: boolean) => void;
  setHasHydrated: (value: boolean) => void;
}

const lineKey = (productId: string, size: string, colorName: string) =>
  `${productId}:${size}:${colorName}`;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,

      addItem: (product, { size, color, quantity = 1 }) =>
        set((state) => {
          const key = lineKey(product.id, size, color.name);
          const existing = state.items.find((i) => i.key === key);

          const items = existing
            ? state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
              )
            : [
                ...state.items,
                {
                  key,
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  size,
                  color,
                  illustration: product.illustration,
                  image: product.images?.[0],
                  quantity,
                } satisfies CartItem,
              ];

          return { items, isOpen: true };
        }),

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        })),

      increment: (key) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        })),

      decrement: (key) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.key === key ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setOpen: (open) => set({ isOpen: open }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "metro-cart",
      storage: createJSONStorage(() => localStorage),
      // `isOpen` / `hasHydrated` are session concerns, not persisted state.
      partialize: (state) => ({ items: state.items }),
      /**
       * Rehydrating at module load would restore the cart *before* React
       * hydrates, so the first client render would disagree with the server
       * HTML (badge present vs. absent). `<CartHydrator />` calls
       * `persist.rehydrate()` from an effect instead, after hydration.
       */
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

/* Selectors ------------------------------------------------------------- */

export const selectItemCount = (state: CartState) =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectSubtotal = (state: CartState) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0);
