import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedItemsState {
  savedIds: string[];
  saveItem: (id: string) => void;
  unsaveItem: (id: string) => void;
  isSaved: (id: string) => boolean;
  clearAll: () => void;
}

export const useSavedItemsStore = create<SavedItemsState>()(
  persist(
    (set, get) => ({
      savedIds: [],

      saveItem: (id: string) => {
        const { savedIds } = get();
        if (!savedIds.includes(id)) {
          set({ savedIds: [...savedIds, id] });
        }
      },

      unsaveItem: (id: string) => {
        set((state) => ({ savedIds: state.savedIds.filter((sid) => sid !== id) }));
      },

      isSaved: (id: string) => {
        return get().savedIds.includes(id);
      },

      clearAll: () => {
        set({ savedIds: [] });
      },
    }),
    {
      name: 'bayanihan-saved-items',
    }
  )
);
