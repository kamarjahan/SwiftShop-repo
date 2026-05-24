import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/mockData';

export interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: any | null;
  addItem: (product: any) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setAppliedCoupon: (coupon: any | null) => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,
      addItem: (product: any) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map(item => 
              item.id === product.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
            isOpen: true
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }], isOpen: true });
        }
      },
      removeItem: (productId: string) => {
        set({ items: get().items.filter(item => item.id !== productId) });
      },
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map(item => 
            item.id === productId ? { ...item, quantity } : item
          )
        });
      },
      clearCart: () => set({ items: [], appliedCoupon: null }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      setIsOpen: (isOpen: boolean) => set({ isOpen }),
      setAppliedCoupon: (coupon: any | null) => set({ appliedCoupon: coupon }),
    }),
    {
      name: 'jachu-cart-storage',
      partialize: (state) => ({ items: state.items, appliedCoupon: state.appliedCoupon }),
    }
  )
);
