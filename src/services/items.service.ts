import type { Item, SearchFilters } from '../types';
import { mockItems, generateId, getUserById } from '../data/mockData';

let itemsStore: Item[] = [...mockItems];

export const itemsService = {
  async getItems(filters?: SearchFilters): Promise<Item[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.query) params.append('query', filters.query);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.condition) params.append('condition', filters.condition);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);

      const res = await fetch(`/api/items?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          // Merge API items with local mock items (avoiding duplicates by id/title)
          const apiItems: Item[] = data.items;
          const apiIds = new Set(apiItems.map((i) => i.id));
          const complementaryMocks = itemsStore.filter((m) => !apiIds.has(m.id));

          let combined = [...apiItems, ...complementaryMocks];

          // Apply client filters on complementary mocks if needed
          if (filters?.query) {
            const q = filters.query.toLowerCase();
            combined = combined.filter(
              (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
            );
          }
          if (filters?.category && filters.category !== 'all') {
            combined = combined.filter((i) => i.category === filters.category);
          }
          if (filters?.condition && (filters.condition as string) !== 'all') {
            combined = combined.filter((i) => i.condition === filters.condition);
          }
          if (filters?.type && (filters.type as string) !== 'all') {
            combined = combined.filter((i) => i.type === filters.type);
          }
          if (filters?.status) {
            combined = combined.filter((i) => i.status === filters.status);
          }

          return combined;
        }
      }
    } catch {
      // Graceful fallback to in-memory store
    }

    await new Promise((r) => setTimeout(r, 100));
    let result = [...itemsStore];

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }

    if (filters?.category && filters.category !== 'all') {
      result = result.filter((i) => i.category === filters.category);
    }

    if (filters?.condition && (filters.condition as string) !== 'all') {
      result = result.filter((i) => i.condition === filters.condition);
    }

    if (filters?.type && (filters.type as string) !== 'all') {
      result = result.filter((i) => i.type === filters.type);
    }

    if (filters?.status) {
      result = result.filter((i) => i.status === filters.status);
    } else {
      result = result.filter((i) => i.status !== 'removed');
    }

    result = result.map((item) => ({
      ...item,
      owner: item.owner || getUserById(item.ownerId),
    }));

    if (filters?.sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (filters?.sortBy === 'nearest') {
      result.sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));
    } else if (filters?.sortBy === 'popular') {
      result.sort((a, b) => b.favorites - a.favorites);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  },

  async getItemById(id: string): Promise<Item | null> {
    try {
      const res = await fetch(`/api/items/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          return data.item;
        }
      }
    } catch {
      // Fallback
    }

    const item = itemsStore.find((i) => i.id === id);
    if (!item) return null;
    return { ...item, owner: item.owner || getUserById(item.ownerId) };
  },

  async createItem(data: Omit<Item, 'id' | 'views' | 'favorites' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          condition: data.condition,
          type: data.type,
          ownerId: data.ownerId,
          quantity: data.quantity || 1,
          availability: data.availability || 'Anytime',
          images: data.images,
          pickupOptions: data.pickupOptions,
          location: data.location,
          tags: (data as any).tags,
        }),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.item) {
          itemsStore.unshift(resData.item);
          return resData.item;
        }
      }
    } catch {
      // Fallback
    }

    const newItem: Item = {
      ...data,
      id: generateId(),
      views: 0,
      favorites: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    itemsStore.unshift(newItem);
    return newItem;
  },

  async toggleFavorite(itemId: string, userId = 'user-1'): Promise<boolean> {
    try {
      const res = await fetch(`/api/items/${encodeURIComponent(itemId)}/save?userId=${encodeURIComponent(userId)}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        return Boolean(data.isSaved);
      }
    } catch {
      // Fallback
    }

    const item = itemsStore.find((i) => i.id === itemId);
    if (item) {
      item.isFavorited = !item.isFavorited;
      item.favorites += item.isFavorited ? 1 : -1;
      return item.isFavorited;
    }
    return false;
  },

  async deleteItem(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/items/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        itemsStore = itemsStore.filter((i) => i.id !== id);
        return true;
      }
    } catch {
      // Fallback
    }

    itemsStore = itemsStore.filter((i) => i.id !== id);
    return true;
  },
};
