import { create } from 'zustand';
import { Product } from './api';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addToCart: (product: Product) => set((state) => {
                const existing = state.items.find(i => i.id === product.id);
                if (existing) {
                    return {
                        items: state.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
                    };
                }
                return { items: [...state.items, { ...product, quantity: 1 }] };
            }),
            removeFromCart: (productId) => set((state) => ({
                items: state.items.filter(i => i.id !== productId)
            })),
            updateQuantity: (productId, delta) => set((state) => ({
                items: state.items.map(item => {
                    if (item.id === productId) {
                        const qty = item.quantity + delta;
                        return { ...item, quantity: qty };
                    }
                    return item;
                }).filter(item => item.quantity > 0)
            })),
            clearCart: () => set({ items: [] }),
            total: () => get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }),
        {
            name: 'sushi-cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
