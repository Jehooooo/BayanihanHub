import type { ItemRequest } from '../types';
import { mockRequests, generateId, getUserById } from '../data/mockData';

let requestsStore: ItemRequest[] = [...mockRequests];

export const requestsService = {
  async getRequests(status?: string): Promise<ItemRequest[]> {
    try {
      const url = status ? `/api/requests?status=${encodeURIComponent(status)}` : '/api/requests';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.requests && Array.isArray(data.requests)) {
          const apiRequests: ItemRequest[] = data.requests;
          const apiIds = new Set(apiRequests.map((r) => r.id));
          const localMocks = requestsStore.filter((m) => !apiIds.has(m.id));

          let filteredMocks = localMocks;
          if (status) {
            filteredMocks = filteredMocks.filter((r) => r.status === status);
          } else {
            filteredMocks = filteredMocks.filter((r) => r.status !== 'cancelled');
          }
          const mappedMocks = filteredMocks.map((req) => ({
            ...req,
            user: getUserById(req.userId),
          }));

          return [...apiRequests, ...mappedMocks];
        }
      }
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 150));
    let list = [...requestsStore];
    if (status) {
      list = list.filter((r) => r.status === status);
    } else {
      list = list.filter((r) => r.status !== 'cancelled');
    }
    return list.map((req) => ({
      ...req,
      user: getUserById(req.userId),
    }));
  },

  async createRequest(data: Omit<ItemRequest, 'id' | 'responses' | 'createdAt' | 'updatedAt'>): Promise<ItemRequest> {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          urgency: data.urgency,
          neededBefore: data.neededBefore,
          userId: data.userId,
          barangay: data.location?.barangay,
          municipality: data.location?.municipality,
          province: data.location?.province,
          address: data.location?.address,
          images: data.images,
        }),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.request) {
          requestsStore.unshift(resData.request);
          return resData.request;
        }
      }
    } catch {
      // Fallback
    }

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
    try {
      if (status === 'completed') {
        const res = await fetch(`/api/requests/${encodeURIComponent(id)}/fulfill`, { method: 'POST' });
        if (res.ok) return true;
      } else if (status === 'cancelled') {
        const res = await fetch(`/api/requests/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) return true;
      }
    } catch {
      // Fallback
    }

    const req = requestsStore.find((r) => r.id === id);
    if (req) {
      req.status = status;
      req.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  },
};
