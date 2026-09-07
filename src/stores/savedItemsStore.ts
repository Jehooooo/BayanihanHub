import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedItemsState {
  savedIds: string[];
  saveItem: (id: string, userId?: string) => Promise<void>;
  unsaveItem: (id: string, userId?: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  clearAll: () => void;
  syncFromBackend: (userId: string) => Promise<void>;
}

export const useSavedItemsStore = create<SavedItemsState>()(
  persist(
    (set, get) => ({
      savedIds: [],

      saveItem: async (id: string, userId = 'user-1') => {
        const { savedIds } = get();
        if (!savedIds.includes(id)) {
          set({ savedIds: [...savedIds, id] });
        }

        try {
          await fetch(`/api/items/${encodeURIComponent(id)}/save?userId=${encodeURIComponent(userId)}`, {
            method: 'POST',
          });
        } catch {
          // Local state already updated
        }
      },

      unsaveItem: async (id: string, userId = 'user-1') => {
        set((state) => ({ savedIds: state.savedIds.filter((sid) => sid !== id) }));

        try {
          await fetch(`/api/items/${encodeURIComponent(id)}/save?userId=${encodeURIComponent(userId)}`, {
            method: 'POST',
          });
        } catch {
          // Local state already updated
        }
      },

      isSaved: (id: string) => {
        return get().savedIds.includes(id);
      },

      clearAll: () => {
        set({ savedIds: [] });
      },

      syncFromBackend: async (userId: string) => {
        try {
          const res = await fetch(`/api/items/saved?userId=${encodeURIComponent(userId)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.savedIds && Array.isArray(data.savedIds)) {
              set({ savedIds: data.savedIds });
            }
          }
        } catch {
          // Keep local state
        }
      },
    }),
    {
      name: 'bayanihan-saved-items',
    }
  )
);
