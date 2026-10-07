import type { User, Item, ItemRequest, Report } from '../types';
import { useAuthStore } from '../stores/authStore';

export interface SuspendUserPayload {
  userId: string | number;
  duration: string;
  customDays?: number;
  reason: string;
  message?: string;
  adminId?: string | number;
}

export interface RemovePostPayload {
  itemId: string | number;
  reason: string;
  message?: string;
  adminId?: string | number;
}

export interface RemoveRequestPayload {
  requestId: string | number;
  reason: string;
  message?: string;
  adminId?: string | number;
}

export interface ResolveReportPayload {
  reportId: string | number;
  action: string;
  message?: string;
  adminId?: string | number;
}

function getAdminAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const user = useAuthStore.getState().user;
  const headers: Record<string, string> = { ...extraHeaders };
  if (user?.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  if (user?.id) {
    headers['X-User-Id'] = String(user.id);
  }
  return headers;
}

export const adminService = {
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/admin/users', {
      headers: getAdminAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to load users (${res.status})`);
    }
    const data = await res.json();
    return data.users || [];
  },

  async getSystemStats(): Promise<{
    totalUsers: number;
    totalPosts: number;
    activeRequests: number;
    totalExchanges: number;
    completedExchanges: number;
    pendingVerifications: number;
  }> {
    const res = await fetch('/api/admin/stats', {
      headers: getAdminAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to load system stats (${res.status})`);
    }
    const data = await res.json();
    return data.stats;
  },

  async suspendUser(payload: SuspendUserPayload): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/users/${payload.userId}/suspend`, {
      method: 'POST',
      headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        duration: payload.duration,
        customDays: payload.customDays,
        reason: payload.reason,
        message: payload.message,
        adminId: payload.adminId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to suspend user');
    }
    return data;
  },

  async unsuspendUser(userId: string | number, adminId?: string | number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/users/${userId}/unsuspend`, {
      method: 'POST',
      headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        adminId: adminId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to unsuspend user');
    }
    return data;
  },

  async getPosts(): Promise<Item[]> {
    const res = await fetch('/api/admin/posts', {
      headers: getAdminAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to load posts (${res.status})`);
    }
    const data = await res.json();
    return data.posts || [];
  },

  async removePost(payload: RemovePostPayload): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/posts/${payload.itemId}/remove`, {
      method: 'POST',
      headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        reason: payload.reason,
        message: payload.message,
        adminId: payload.adminId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to remove post');
    }
    return data;
  },

  async getRequests(): Promise<ItemRequest[]> {
    const res = await fetch('/api/admin/requests', {
      headers: getAdminAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to load requests (${res.status})`);
    }
    const data = await res.json();
    return data.requests || [];
  },

  async removeRequest(payload: RemoveRequestPayload): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/requests/${payload.requestId}/remove`, {
      method: 'POST',
      headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        reason: payload.reason,
        message: payload.message,
        adminId: payload.adminId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to remove request');
    }
    return data;
  },

  async getReports(): Promise<Report[]> {
    const res = await fetch('/api/admin/reports', {
      headers: getAdminAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to load reports (${res.status})`);
    }
    const data = await res.json();
    return data.reports || [];
  },

  async getReportStats(): Promise<{
    total: number;
    pending: number;
    underReview: number;
    resolved: number;
    dismissed: number;
    highPriority: number;
  }> {
    const res = await fetch('/api/admin/reports/stats', {
      headers: getAdminAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to load report stats (${res.status})`);
    }
    return res.json();
  },

  async updateReportStatus(
    reportId: string | number,
    status: 'pending' | 'under_review' | 'resolved' | 'dismissed',
    adminId?: string | number
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/reports/${reportId}/status`, {
      method: 'POST',
      headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        status,
        adminId: adminId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to update report status');
    }
    return data;
  },

  async resolveReport(payload: ResolveReportPayload): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/reports/${payload.reportId}/resolve`, {
      method: 'POST',
      headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        action: payload.action,
        message: payload.message,
        adminId: payload.adminId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to resolve report');
    }
    return data;
  },

  async getUserModerationHistory(userId: string | number): Promise<{
    success: boolean;
    userId: string;
    warnings: number;
    suspensions: number;
    removedPosts: number;
    reportsReceived: number;
    history: Array<{
      id: number;
      date: string;
      action: string;
      details?: string;
      admin: string;
    }>;
  }> {
    const res = await fetch(`/api/admin/users/${userId}/moderation-history`, {
      headers: getAdminAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to load moderation history (${res.status})`);
    }
    return res.json();
  },
  async getRatings(filters?: {
    search?: string;
    score?: number;
    status?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ ratings: any[]; total: number; page: number; limit: number }> {
    const { user } = useAuthStore.getState();
    const adminId = user?.id;
    try {
      const params = new URLSearchParams();
      if (adminId) params.append('adminId', String(adminId));
      if (filters?.search) params.append('search', filters.search);
      if (filters?.score) params.append('score', String(filters.score));
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const res = await fetch(`/api/admin/ratings?${params.toString()}`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          ratings: data.ratings || [],
          total: data.total ?? (data.ratings || []).length,
          page: data.page ?? 1,
          limit: data.limit ?? 50,
        };
      }
    } catch (err) {
      console.error('[adminService.getRatings] Error:', err);
    }
    return { ratings: [], total: 0, page: 1, limit: 50 };
  },

  async updateRatingStatus(
    ratingId: string,
    status: 'active' | 'hidden',
    reason?: string
  ): Promise<{ success: boolean; message: string; status?: string }> {
    const { user } = useAuthStore.getState();
    const adminId = user?.id;
    const res = await fetch(`/api/admin/ratings/${encodeURIComponent(ratingId)}/status`, {
      method: 'PATCH',
      headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, reason, adminId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to update rating status');
    }
    return data;
  },

  async deleteRating(ratingId: string, permanent: boolean = false): Promise<boolean> {
    const { user } = useAuthStore.getState();
    const adminId = user?.id;
    try {
      const res = await fetch(
        `/api/admin/ratings/${encodeURIComponent(ratingId)}?adminId=${adminId}&permanent=${permanent}`,
        {
          method: 'DELETE',
          headers: getAdminAuthHeaders(),
        }
      );
      return res.ok;
    } catch (err) {
      console.error(`[adminService.deleteRating] Error:`, err);
    }
    return false;
  },

  async getRankings(filters?: {
    search?: string;
    minRatings?: number;
    reputationLevel?: string;
    sortBy?: string;
  }): Promise<{
    summary: {
      totalUsers: number;
      totalRatedUsers: number;
      totalRatings: number;
      platformAverageRating: number | null;
      topRatedUser: { name: string; average: number | null; ratings: number } | null;
    };
    rankings: any[];
  }> {
    const { user } = useAuthStore.getState();
    const adminId = user?.id;
    try {
      const params = new URLSearchParams();
      if (adminId) params.append('adminId', String(adminId));
      if (filters?.search) params.append('search', filters.search);
      if (filters?.minRatings) params.append('minRatings', String(filters.minRatings));
      if (filters?.reputationLevel) params.append('reputationLevel', filters.reputationLevel);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);

      const res = await fetch(`/api/admin/rankings?${params.toString()}`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('[adminService.getRankings] Error:', err);
    }
    return {
      summary: {
        totalUsers: 0,
        totalRatedUsers: 0,
        totalRatings: 0,
        platformAverageRating: null,
        topRatedUser: null,
      },
      rankings: [],
    };
  },

  async getBadges(): Promise<any[]> {
    try {
      const res = await fetch('/api/admin/badges', {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.badges || [];
      }
    } catch (err) {
      console.error('[adminService.getBadges] Error:', err);
    }
    return [];
  },

  async awardBadge(
    userId: string | number,
    badgeId: number,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    const { user } = useAuthStore.getState();
    const adminId = user?.id;
    const cleanUid = String(userId).replace('user-', '');
    const res = await fetch(`/api/admin/users/${encodeURIComponent(cleanUid)}/badges`, {
      method: 'POST',
      headers: getAdminAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ badgeId, reason, adminId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to award badge');
    }
    return data;
  },

  async revokeBadge(
    userId: string | number,
    badgeId: number,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    const { user } = useAuthStore.getState();
    const adminId = user?.id;
    const cleanUid = String(userId).replace('user-', '');
    const res = await fetch(
      `/api/admin/users/${encodeURIComponent(cleanUid)}/badges/${badgeId}?adminId=${adminId}&reason=${encodeURIComponent(reason || '')}`,
      {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to revoke badge');
    }
    return data;
  },

  async getUserBadgeHistory(userId: string | number): Promise<any[]> {
    const cleanUid = String(userId).replace('user-', '');
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(cleanUid)}/badge-history`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.history || [];
      }
    } catch (err) {
      console.error('[adminService.getUserBadgeHistory] Error:', err);
    }
    return [];
  },
};

