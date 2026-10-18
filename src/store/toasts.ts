import { create } from 'zustand';

export interface Toast {
  id: number;
  title: string;
  body?: string;
  link?: string;
  tone: 'info' | 'fact' | 'alert' | 'done';
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>, ms?: number) => void;
  dismiss: (id: number) => void;
}

let next = 1;

export const useToasts = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (t, ms = 6500) => {
    const id = next++;
    set({ toasts: [...get().toasts.slice(-2), { ...t, id }] });
    if (ms > 0) setTimeout(() => get().dismiss(id), ms);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
