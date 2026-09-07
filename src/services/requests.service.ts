import type { ItemRequest } from '../types';
import { mockRequests, generateId, getUserById } from '../data/mockData';

const PERSISTED_REQUESTS_KEY = 'bayanihan_persisted_requests';

function getLocalPersistedRequests(): ItemRequest[] {
  try {
    const raw = localStorage.getItem(PERSISTED_REQUESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalPersistedRequest(req: ItemRequest): void {
  try {
    const current = getLocalPersistedRequests();
    const filtered = current.filter(
      (r) =>
        r.id !== req.id &&
        String(r.id).replace('req-', '') !== String(req.id).replace('req-', '')
    );
    filtered.unshift(req);
    localStorage.setItem(PERSISTED_REQUESTS_KEY, JSON.stringify(filtered.slice(0, 100)));
  } catch {
    // ignore
  }
}

function normalizeId(id: string | number): string {
  return String(id).trim();
}

function matchesId(req: ItemRequest, targetId: string): boolean {
  const normTarget = normalizeId(targetId);
  const normReqId = normalizeId(req.id);
  if (normReqId === normTarget) return true;
  if (normReqId === `req-${normTarget}` || `req-${normReqId}` === normTarget) return true;
  const bareReq = normReqId.replace('req-', '');
  const bareTarget = normTarget.replace('req-', '');
  if (bareReq && bareTarget && bareReq === bareTarget) return true;
  if ((req as any).requestId && String((req as any).requestId) === bareTarget) return true;
  return false;
}

let requestsStore: ItemRequest[] = [...getLocalPersistedRequests(), ...mockRequests];

export const requestsService = {
  async getRequests(status?: string): Promise<ItemRequest[]> {
    const localPersisted = getLocalPersistedRequests();

    try {
      const url = status ? `/api/requests?status=${encodeURIComponent(status)}` : '/api/requests';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.requests && Array.isArray(data.requests)) {
          const apiRequests: ItemRequest[] = data.requests;
          const apiIds = new Set(apiRequests.map((r) => normalizeId(r.id)));
          const apiBareIds = new Set(apiRequests.map((r) => normalizeId(r.id).replace('req-', '')));

          const localMocks = [...localPersisted, ...requestsStore].filter((m) => {
            const mId = normalizeId(m.id);
            const mBare = mId.replace('req-', '');
            return !apiIds.has(mId) && !apiBareIds.has(mBare);
          });

          // Deduplicate
          const seen = new Set<string>();
          const uniqueLocal: ItemRequest[] = [];
          for (const item of localMocks) {
            const bare = normalizeId(item.id).replace('req-', '');
            if (!seen.has(bare)) {
              seen.add(bare);
              uniqueLocal.push(item);
            }
          }

          let filteredMocks = uniqueLocal;
          if (status) {
            filteredMocks = filteredMocks.filter((r) => r.status === status);
          } else {
            filteredMocks = filteredMocks.filter((r) => r.status !== 'cancelled');
          }
          const mappedMocks = filteredMocks.map((req) => ({
            ...req,
            user: req.user || getUserById(req.userId),
          }));

          return [...apiRequests, ...mappedMocks];
        }
      }
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 150));
    let list = [...localPersisted, ...requestsStore];

    const seenMap = new Map<string, ItemRequest>();
    for (const r of list) {
      if (!seenMap.has(r.id)) seenMap.set(r.id, r);
    }
    list = Array.from(seenMap.values());

    if (status) {
      list = list.filter((r) => r.status === status);
    } else {
      list = list.filter((r) => r.status !== 'cancelled');
    }
    return list.map((req) => ({
      ...req,
      user: req.user || getUserById(req.userId),
    }));
  },

  async getRequestById(id: string): Promise<ItemRequest | null> {
    if (!id) return null;

    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.request) {
          saveLocalPersistedRequest(data.request);
          return data.request;
        }
      }
    } catch {
      // ignore
    }

    const localPersisted = getLocalPersistedRequests();
    const persistedMatch = localPersisted.find((r) => matchesId(r, id));
    if (persistedMatch) {
      return { ...persistedMatch, user: persistedMatch.user || getUserById(persistedMatch.userId) };
    }

    const match = requestsStore.find((r) => matchesId(r, id)) || mockRequests.find((r) => matchesId(r, id));
    if (match) {
      return { ...match, user: match.user || getUserById(match.userId) };
    }

    return null;
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
          saveLocalPersistedRequest(resData.request);
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
    saveLocalPersistedRequest(newReq);
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

    const req = requestsStore.find((r) => matchesId(r, id));
    if (req) {
      req.status = status;
      req.updatedAt = new Date().toISOString();
      saveLocalPersistedRequest(req);
      return true;
    }
    return false;
  },
};
