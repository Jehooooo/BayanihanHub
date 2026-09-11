import type { ItemRequest } from '../types';

export const requestsService = {
  async getRequests(status?: string): Promise<ItemRequest[]> {
    try {
      const url = status && status !== 'all'
        ? `/api/requests?status=${encodeURIComponent(status)}`
        : '/api/requests';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.requests && Array.isArray(data.requests)) {
          return data.requests;
        }
      }
    } catch (err) {
      console.error('[requestsService.getRequests] Error fetching requests:', err);
    }
    return [];
  },

  async getRequestById(id: string): Promise<ItemRequest | null> {
    if (!id) return null;

    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.request) {
          return data.request;
        }
      }

      const bare = String(id).replace('req-', '').trim();
      if (bare && bare !== id) {
        const altRes = await fetch(`/api/requests/${encodeURIComponent(bare)}`);
        if (altRes.ok) {
          const altData = await altRes.json();
          if (altData.request) return altData.request;
        }
      }
    } catch (err) {
      console.error(`[requestsService.getRequestById] Error fetching request ${id}:`, err);
    }

    return null;
  },

  async createRequest(data: Omit<ItemRequest, 'id' | 'responses' | 'createdAt' | 'updatedAt'>): Promise<ItemRequest> {
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

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || 'Failed to submit assistance request.');
    }

    const resData = await res.json();
    if (resData.request) {
      return resData.request;
    }

    throw new Error('Invalid response from server when creating request.');
  },

  async updateRequestStatus(id: string, status: ItemRequest['status']): Promise<boolean> {
    try {
      if (status === 'completed') {
        const res = await fetch(`/api/requests/${encodeURIComponent(id)}/fulfill`, { method: 'POST' });
        return res.ok;
      } else if (status === 'cancelled') {
        const res = await fetch(`/api/requests/${encodeURIComponent(id)}`, { method: 'DELETE' });
        return res.ok;
      }
    } catch (err) {
      console.error(`[requestsService.updateRequestStatus] Error updating request ${id}:`, err);
    }
    return false;
  },
};
