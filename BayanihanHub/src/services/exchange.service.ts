import type { Exchange, ExchangeStatus } from '../types';
import { mockExchanges, generateId, getItemById, getUserById } from '../data/mockData';

let exchangeStore: Exchange[] = [...mockExchanges];

export const exchangeService = {
  async getExchanges(userId?: string): Promise<Exchange[]> {
    await new Promise((r) => setTimeout(r, 200));
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
    await new Promise((r) => setTimeout(r, 400));
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
    await new Promise((r) => setTimeout(r, 300));
    const exc = exchangeStore.find((e) => e.id === id);
    if (!exc) return null;

    exc.status = status;
    exc.updatedAt = new Date().toISOString();
    if (extra?.meetingDate) exc.meetingDate = extra.meetingDate;
    if (extra?.meetingLocation) exc.meetingLocation = extra.meetingLocation;
    if (status === 'completed') exc.completedAt = new Date().toISOString();

    return exc;
  }
};
