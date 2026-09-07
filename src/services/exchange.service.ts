import type { Exchange, ExchangeStatus } from '../types';
import { mockExchanges, generateId, getItemById, getUserById } from '../data/mockData';
import { itemsService } from './items.service';

const PERSISTED_EXCHANGES_KEY = 'bayanihan_persisted_exchanges';

function getLocalPersistedExchanges(): Exchange[] {
  try {
    const raw = localStorage.getItem(PERSISTED_EXCHANGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalPersistedExchange(exc: Exchange): void {
  try {
    const current = getLocalPersistedExchanges();
    const filtered = current.filter(
      (e) =>
        e.id !== exc.id &&
        String(e.id).replace('exc-', '') !== String(exc.id).replace('exc-', '')
    );
    filtered.unshift(exc);
    localStorage.setItem(PERSISTED_EXCHANGES_KEY, JSON.stringify(filtered.slice(0, 100)));
  } catch {
    // ignore
  }
}

function normalizeId(id: string | number): string {
  return String(id).trim();
}

function matchesId(exc: Exchange, targetId: string): boolean {
  const normTarget = normalizeId(targetId);
  const normExcId = normalizeId(exc.id);
  if (normExcId === normTarget) return true;
  if (normExcId === `exc-${normTarget}` || `exc-${normExcId}` === normTarget) return true;
  const bareExc = normExcId.replace('exc-', '');
  const bareTarget = normTarget.replace('exc-', '');
  if (bareExc && bareTarget && bareExc === bareTarget) return true;
  if ((exc as any).exchangeId && String((exc as any).exchangeId) === bareTarget) return true;
  return false;
}

let exchangeStore: Exchange[] = [...getLocalPersistedExchanges(), ...mockExchanges];

export const exchangeService = {
  async getExchanges(userId?: string): Promise<Exchange[]> {
    const localPersisted = getLocalPersistedExchanges();

    try {
      const url = userId ? `/api/exchanges?userId=${encodeURIComponent(userId)}` : '/api/exchanges';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.exchanges && Array.isArray(data.exchanges)) {
          const apiExchanges: Exchange[] = data.exchanges;
          const apiIds = new Set(apiExchanges.map((e) => normalizeId(e.id)));
          const apiBareIds = new Set(apiExchanges.map((e) => normalizeId(e.id).replace('exc-', '')));

          const localMocks = [...localPersisted, ...exchangeStore].filter((m) => {
            const mId = normalizeId(m.id);
            const mBare = mId.replace('exc-', '');
            return !apiIds.has(mId) && !apiBareIds.has(mBare);
          });

          // Deduplicate
          const seen = new Set<string>();
          const uniqueLocal: Exchange[] = [];
          for (const item of localMocks) {
            const bare = normalizeId(item.id).replace('exc-', '');
            if (!seen.has(bare)) {
              seen.add(bare);
              uniqueLocal.push(item);
            }
          }

          let filteredMocks = uniqueLocal;
          if (userId) {
            filteredMocks = filteredMocks.filter((e) => e.offererId === userId || e.receiverId === userId);
          }
          const mappedMocks = filteredMocks.map((exc) => ({
            ...exc,
            offeredItem: exc.offeredItem || getItemById(exc.offeredItemId),
            requestedItem: exc.requestedItem || getItemById(exc.requestedItemId),
            offerer: exc.offerer || getUserById(exc.offererId),
            receiver: exc.receiver || getUserById(exc.receiverId),
          }));

          return [...apiExchanges, ...mappedMocks];
        }
      }
    } catch {
      // Fallback to local memory
    }

    await new Promise((r) => setTimeout(r, 150));
    let list = [...localPersisted, ...exchangeStore];

    const seenMap = new Map<string, Exchange>();
    for (const e of list) {
      if (!seenMap.has(e.id)) seenMap.set(e.id, e);
    }
    list = Array.from(seenMap.values());

    if (userId) {
      list = list.filter((e) => e.offererId === userId || e.receiverId === userId);
    }
    return list.map((exc) => ({
      ...exc,
      offeredItem: exc.offeredItem || getItemById(exc.offeredItemId),
      requestedItem: exc.requestedItem || getItemById(exc.requestedItemId),
      offerer: exc.offerer || getUserById(exc.offererId),
      receiver: exc.receiver || getUserById(exc.receiverId),
    }));
  },

  async createExchange(data: {
    offeredItemId: string;
    requestedItemId: string;
    offererId: string;
    receiverId: string;
    message: string;
  }): Promise<Exchange> {
    try {
      const res = await fetch('/api/exchanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.exchange) {
          exchangeStore.unshift(resData.exchange);
          saveLocalPersistedExchange(resData.exchange);
          return resData.exchange;
        }
      }
    } catch {
      // Fallback
    }

    const newExc: Exchange = {
      ...data,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    exchangeStore.unshift(newExc);
    saveLocalPersistedExchange(newExc);
    return newExc;
  },

  async updateExchangeStatus(
    id: string,
    status: ExchangeStatus,
    extra?: { meetingDate?: string; meetingLocation?: string }
  ): Promise<Exchange | null> {
    try {
      let endpoint = '';
      if (status === 'accepted') endpoint = `/api/exchanges/${encodeURIComponent(id)}/accept`;
      else if (status === 'rejected' || status === 'cancelled') endpoint = `/api/exchanges/${encodeURIComponent(id)}/decline`;
      else if (status === 'completed') endpoint = `/api/exchanges/${encodeURIComponent(id)}/complete`;

      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            meetingDate: extra?.meetingDate,
            meetingLocation: extra?.meetingLocation,
          }),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.exchange) {
            saveLocalPersistedExchange(resData.exchange);
            return resData.exchange;
          }
        }
      }
    } catch {
      // Fallback
    }

    const exc = exchangeStore.find((e) => matchesId(e, id));
    if (!exc) return null;

    exc.status = status;
    exc.updatedAt = new Date().toISOString();
    if (extra?.meetingDate) exc.meetingDate = extra.meetingDate;
    if (extra?.meetingLocation) exc.meetingLocation = extra.meetingLocation;
    if (status === 'completed') exc.completedAt = new Date().toISOString();

    saveLocalPersistedExchange(exc);
    return exc;
  },
};
