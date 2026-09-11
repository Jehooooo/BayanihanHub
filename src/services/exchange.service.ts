import type { Exchange, ExchangeStatus } from '../types';

export const exchangeService = {
  async getExchanges(userId?: string): Promise<Exchange[]> {
    try {
      const url = userId ? `/api/exchanges?userId=${encodeURIComponent(userId)}` : '/api/exchanges';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.exchanges && Array.isArray(data.exchanges)) {
          return data.exchanges;
        }
      }
    } catch (err) {
      console.error('[exchangeService.getExchanges] Error fetching exchanges:', err);
    }
    return [];
  },

  async createExchange(data: {
    offeredItemId: string;
    requestedItemId: string;
    offererId: string;
    receiverId: string;
    message: string;
  }): Promise<Exchange> {
    const res = await fetch('/api/exchanges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || 'Failed to submit exchange proposal.');
    }

    const resData = await res.json();
    if (resData.exchange) {
      return resData.exchange;
    }

    throw new Error('Invalid response from server when creating exchange.');
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
    } catch (err) {
      console.error(`[exchangeService.updateExchangeStatus] Error updating exchange ${id}:`, err);
    }

    return null;
  },
};
