import type { Exchange, ExchangeStatus } from '../types';
import { mockExchanges, generateId, getItemById, getUserById } from '../data/mockData';

let exchangeStore: Exchange[] = [...mockExchanges];

export const exchangeService = {
  async getExchanges(userId?: string): Promise<Exchange[]> {
    try {
      const url = userId ? `/api/exchanges?userId=${encodeURIComponent(userId)}` : '/api/exchanges';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.exchanges && Array.isArray(data.exchanges)) {
          const apiExchanges: Exchange[] = data.exchanges;
          const apiIds = new Set(apiExchanges.map((e) => e.id));
          const localMocks = exchangeStore.filter((m) => !apiIds.has(m.id));

          let filteredMocks = localMocks;
          if (userId) {
            filteredMocks = filteredMocks.filter((e) => e.offererId === userId || e.receiverId === userId);
          }
          const mappedMocks = filteredMocks.map((exc) => ({
            ...exc,
            offeredItem: getItemById(exc.offeredItemId),
            requestedItem: getItemById(exc.requestedItemId),
            offerer: getUserById(exc.offererId),
            receiver: getUserById(exc.receiverId),
          }));

          return [...apiExchanges, ...mappedMocks];
        }
      }
    } catch {
      // Fallback to local memory
    }

    await new Promise((r) => setTimeout(r, 150));
    let list = [...exchangeStore];
    if (userId) {
      list = list.filter((e) => e.offererId === userId || e.receiverId === userId);
    }
    return list.map((exc) => ({
      ...exc,
      offeredItem: getItemById(exc.offeredItemId),
      requestedItem: getItemById(exc.requestedItemId),
      offerer: getUserById(exc.offererId),
      receiver: getUserById(exc.receiverId),
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
            return resData.exchange;
          }
        }
      }
    } catch {
      // Fallback
    }

    const exc = exchangeStore.find((e) => e.id === id);
    if (!exc) return null;

    exc.status = status;
    exc.updatedAt = new Date().toISOString();
    if (extra?.meetingDate) exc.meetingDate = extra.meetingDate;
    if (extra?.meetingLocation) exc.meetingLocation = extra.meetingLocation;
    if (status === 'completed') exc.completedAt = new Date().toISOString();

    return exc;
  },
};
