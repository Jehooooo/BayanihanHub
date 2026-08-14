import type { ItemRequest } from '../types';
import { mockRequests, generateId, getUserById } from '../data/mockData';

let requestsStore: ItemRequest[] = [...mockRequests];

export const requestsService = {
  async getRequests(status?: string): Promise<ItemRequest[]> {
    await new Promise((r) => setTimeout(r, 200));
    let list = [...requestsStore];
    if (status) {
      list = list.filter((r) => r.status === status);
    }
    return list.map((req) => ({
      ...req,
      user: getUserById(req.userId),
    }));
  },

  async createRequest(data: Omit<ItemRequest, 'id' | 'responses' | 'createdAt' | 'updatedAt'>): Promise<ItemRequest> {
    await new Promise((r) => setTimeout(r, 400));
    const newReq: ItemRequest = {
      ...data,
      id: generateId(),
      responses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    requestsStore.unshift(newReq);
    return newReq;
  },

  async updateRequestStatus(id: string, status: ItemRequest['status']): Promise<boolean> {
    const req = requestsStore.find((r) => r.id === id);
    if (req) {
      req.status = status;
      req.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
};
