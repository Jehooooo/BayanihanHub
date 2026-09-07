import type { Item, SearchFilters } from '../types';
import { mockItems, generateId, getUserById } from '../data/mockData';

const PERSISTED_ITEMS_KEY = 'bayanihan_persisted_items';

function getLocalPersistedItems(): Item[] {
  try {
    const raw = localStorage.getItem(PERSISTED_ITEMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalPersistedItem(item: Item): void {
  try {
    const current = getLocalPersistedItems();
    const filtered = current.filter(
      (i) =>
        i.id !== item.id &&
        String(i.id).replace('item-', '') !== String(item.id).replace('item-', '')
    );
    filtered.unshift(item);
    localStorage.setItem(PERSISTED_ITEMS_KEY, JSON.stringify(filtered.slice(0, 100)));
  } catch {
    // ignore
  }
}

function normalizeId(id: string | number): string {
  return String(id).trim();
}

function matchesId(item: Item, targetId: string): boolean {
  const normTarget = normalizeId(targetId);
  const normItemId = normalizeId(item.id);
  if (normItemId === normTarget) return true;
  if (normItemId === `item-${normTarget}` || `item-${normItemId}` === normTarget) return true;
  const bareItem = normItemId.replace('item-', '');
  const bareTarget = normTarget.replace('item-', '');
  if (bareItem && bareTarget && bareItem === bareTarget) return true;
  if ((item as any).itemId && String((item as any).itemId) === bareTarget) return true;
  return false;
}

// Initial in-memory store initialized with mockItems + any previously persisted local items
let itemsStore: Item[] = [...getLocalPersistedItems(), ...mockItems];

export const itemsService = {
  async getItems(filters?: SearchFilters): Promise<Item[]> {
    const localPersisted = getLocalPersistedItems();

    try {
      const params = new URLSearchParams();
      if (filters?.query) params.append('query', filters.query);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.condition) params.append('condition', filters.condition);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.ownerId) params.append('ownerId', filters.ownerId);

      const res = await fetch(`/api/items?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          const apiItems: Item[] = data.items;
          const apiIds = new Set(apiItems.map((i) => normalizeId(i.id)));
          const apiBareIds = new Set(apiItems.map((i) => normalizeId(i.id).replace('item-', '')));

          // Merge API items with local/mock items not yet in API
          const complementaryMocks = [...localPersisted, ...itemsStore].filter((m) => {
            const mId = normalizeId(m.id);
            const mBare = mId.replace('item-', '');
            return !apiIds.has(mId) && !apiBareIds.has(mBare);
          });

          // Deduplicate complementary
          const seen = new Set<string>();
          const uniqueComplementary: Item[] = [];
          for (const c of complementaryMocks) {
            const bare = normalizeId(c.id).replace('item-', '');
            if (!seen.has(bare)) {
              seen.add(bare);
              uniqueComplementary.push(c);
            }
          }

          let combined = [...apiItems, ...uniqueComplementary];

          // Apply client filters if needed
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
          if (filters?.ownerId) {
            const normOwner = normalizeId(filters.ownerId).replace('user-', '');
            combined = combined.filter((i) => {
              const itemOwner = normalizeId(i.ownerId || (i.owner && i.owner.id) || '').replace('user-', '');
              return itemOwner === normOwner || i.ownerId === filters.ownerId;
            });
          }

          return combined;
        }
      }
    } catch {
      // Graceful fallback to in-memory store
    }

    await new Promise((r) => setTimeout(r, 100));
    let result = [...localPersisted, ...itemsStore];

    // Deduplicate
    const seenMap = new Map<string, Item>();
    for (const it of result) {
      if (!seenMap.has(it.id)) seenMap.set(it.id, it);
    }
    result = Array.from(seenMap.values());

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

    if (filters?.ownerId) {
      const normOwner = normalizeId(filters.ownerId).replace('user-', '');
      result = result.filter((i) => {
        const itemOwner = normalizeId(i.ownerId || (i.owner && i.owner.id) || '').replace('user-', '');
        return itemOwner === normOwner || i.ownerId === filters.ownerId;
      });
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
    if (!id) return null;

    // 1. Try API with given id
    try {
      const res = await fetch(`/api/items/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          saveLocalPersistedItem(data.item);
          return data.item;
        }
      }
    } catch {
      // ignore
    }

    // 2. If id was numeric or item-prefixed, try alternate format via API
    const bare = normalizeId(id).replace('item-', '');
    if (bare && bare !== id) {
      try {
        const altRes = await fetch(`/api/items/${encodeURIComponent(bare)}`);
        if (altRes.ok) {
          const altData = await altRes.json();
          if (altData.item) {
            saveLocalPersistedItem(altData.item);
            return altData.item;
          }
        }
      } catch {
        // ignore
      }
    } else if (bare && !id.startsWith('item-')) {
      try {
        const altRes = await fetch(`/api/items/item-${encodeURIComponent(bare)}`);
        if (altRes.ok) {
          const altData = await altRes.json();
          if (altData.item) {
            saveLocalPersistedItem(altData.item);
            return altData.item;
          }
        }
      } catch {
        // ignore
      }
    }

    // 3. Fallback to local persisted items
    const localPersisted = getLocalPersistedItems();
    const persistedMatch = localPersisted.find((i) => matchesId(i, id));
    if (persistedMatch) {
      return {
        ...persistedMatch,
        owner: persistedMatch.owner || getUserById(persistedMatch.ownerId),
      };
    }

    // 4. Fallback to in-memory itemsStore & mockItems
    const inMemMatch = itemsStore.find((i) => matchesId(i, id)) || mockItems.find((i) => matchesId(i, id));
    if (inMemMatch) {
      return {
        ...inMemMatch,
        owner: inMemMatch.owner || getUserById(inMemMatch.ownerId),
      };
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
    } catch {
      // ignore and fallback to data URL
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
          saveLocalPersistedItem(resData.item);
          return resData.item;
        }
      }
    } catch {
      // Fallback to local creation
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
    saveLocalPersistedItem(newItem);
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

    const item = itemsStore.find((i) => matchesId(i, itemId));
    if (item) {
      item.isFavorited = !item.isFavorited;
      item.favorites += item.isFavorited ? 1 : -1;
      saveLocalPersistedItem(item);
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
        itemsStore = itemsStore.filter((i) => !matchesId(i, id));
        const currentPersisted = getLocalPersistedItems().filter((i) => !matchesId(i, id));
        localStorage.setItem(PERSISTED_ITEMS_KEY, JSON.stringify(currentPersisted));
        return true;
      }
    } catch {
      // Fallback
    }

    itemsStore = itemsStore.filter((i) => !matchesId(i, id));
    const currentPersisted = getLocalPersistedItems().filter((i) => !matchesId(i, id));
    localStorage.setItem(PERSISTED_ITEMS_KEY, JSON.stringify(currentPersisted));
    return true;
  },
};
