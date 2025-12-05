import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types/api';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.productId === product.productId
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.productId === product.productId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity: 1 }],
          };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.product.productId !== productId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.product.productId === productId ? { ...item, quantity } : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
