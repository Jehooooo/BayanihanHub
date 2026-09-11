import type { Item, SearchFilters } from '../types';

export const itemsService = {
  async getItems(filters?: SearchFilters): Promise<Item[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.query) params.append('query', filters.query);
      if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters?.condition && (filters.condition as string) !== 'all') params.append('condition', filters.condition);
      if (filters?.type && (filters.type as string) !== 'all') params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.ownerId) params.append('ownerId', filters.ownerId);

      const res = await fetch(`/api/items?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          return data.items;
        }
      }
    } catch (err) {
      console.error('[itemsService.getItems] Error fetching items:', err);
    }
    return [];
  },

  async getItemById(id: string): Promise<Item | null> {
    if (!id) return null;

    try {
      const res = await fetch(`/api/items/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          return data.item;
        }
      }

      // If id was numeric or item-prefixed, try alternate format
      const bare = String(id).replace('item-', '').trim();
      if (bare && bare !== id) {
        const altRes = await fetch(`/api/items/${encodeURIComponent(bare)}`);
        if (altRes.ok) {
          const altData = await altRes.json();
          if (altData.item) return altData.item;
        }
      }
    } catch (err) {
      console.error(`[itemsService.getItemById] Error fetching item ${id}:`, err);
    }

    return null;
  },

  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/items/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (err) {
      console.error('[itemsService.uploadImage] Error uploading file:', err);
    }

    // Fallback: read file as Base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async createItem(data: Omit<Item, 'id' | 'views' | 'favorites' | 'createdAt' | 'updatedAt'>): Promise<Item> {
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

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || 'Failed to create item listing.');
    }

    const resData = await res.json();
    if (resData.item) {
      return resData.item;
    }

    throw new Error('Invalid response from server when creating item.');
  },

  async toggleFavorite(itemId: string, userId?: string): Promise<boolean> {
    if (!userId) return false;
    try {
      const res = await fetch(`/api/items/${encodeURIComponent(itemId)}/save?userId=${encodeURIComponent(userId)}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        return Boolean(data.isSaved);
      }
    } catch (err) {
      console.error(`[itemsService.toggleFavorite] Error saving item ${itemId}:`, err);
    }
    return false;
  },

  async deleteItem(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/items/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.error(`[itemsService.deleteItem] Error deleting item ${id}:`, err);
      return false;
    }
  },
};
