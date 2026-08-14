import type { Item, SearchFilters, ItemCondition, ItemType } from '../types';
import { mockItems, generateId, getUserById } from '../data/mockData';

let itemsStore: Item[] = [...mockItems];

export const itemsService = {
  async getItems(filters?: SearchFilters): Promise<Item[]> {
    await new Promise((r) => setTimeout(r, 200));
    let result = [...itemsStore];

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }

    if (filters?.category) {
      result = result.filter((i) => i.category === filters.category);
    }

    if (filters?.condition) {
      result = result.filter((i) => i.condition === filters.condition);
    }

    if (filters?.type) {
      result = result.filter((i) => i.type === filters.type);
    }

    if (filters?.status) {
      result = result.filter((i) => i.status === filters.status);
    }

    // Populate owner
    result = result.map((item) => ({
      ...item,
      owner: getUserById(item.ownerId),
    }));

    if (filters?.sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (filters?.sortBy === 'nearest') {
      result.sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));
    } else if (filters?.sortBy === 'popular') {
      result.sort((a, b) => b.favorites - a.favorites);
    } else {
      // Default: newest
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  },

  async getItemById(id: string): Promise<Item | null> {
    await new Promise((r) => setTimeout(r, 150));
    const item = itemsStore.find((i) => i.id === id);
    if (!item) return null;
    return { ...item, owner: getUserById(item.ownerId) };
  },

  async createItem(data: Omit<Item, 'id' | 'views' | 'favorites' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    await new Promise((r) => setTimeout(r, 400));
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

  async toggleFavorite(itemId: string): Promise<boolean> {
    const item = itemsStore.find((i) => i.id === itemId);
    if (item) {
      item.isFavorited = !item.isFavorited;
      item.favorites += item.isFavorited ? 1 : -1;
      return item.isFavorited;
    }
    return false;
  },

  async deleteItem(id: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 300));
    itemsStore = itemsStore.filter((i) => i.id !== id);
    return true;
  }
};
