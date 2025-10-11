import { create } from 'zustand';

interface CartItem { id: string; title: string; price: number; qty: number; image?: string; }

export const useCartStore = create<{
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  updateQty: (id: string, qty: number) => void;
}>((set) => ({
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
  add: (item) => set(state => {
    const existing = state.items.find(i => i.id === item.id);
    const items = existing
      ? state.items.map(i => i.id === item.id ? { ...i, qty: i.qty + item.qty } : i)
      : [...state.items, item];
    localStorage.setItem('cart', JSON.stringify(items));
    return { items };
  }),
  remove: (id) => set(state => {
    const items = state.items.filter(i => i.id !== id);
    localStorage.setItem('cart', JSON.stringify(items));
    return { items };
  }),
  clear: () => { localStorage.setItem('cart', '[]'); set({ items: [] }); },
  updateQty: (id, qty) => set(state => {
    const items = state.items.map(i => i.id === id ? { ...i, qty: Math.max(0, qty) } : i)
      .filter(i => i.qty > 0); // Remove items with 0 qty
    localStorage.setItem('cart', JSON.stringify(items));
    return { items };
  }),
}));
