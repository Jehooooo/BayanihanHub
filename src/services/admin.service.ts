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
  async getRatings(): Promise<any[]> {
    const { user } = useAuthStore.getState();
    const adminId = user?.id;
    try {
      const res = await fetch(`/api/admin/ratings?adminId=${adminId}`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.ratings || [];
      }
    } catch (err) {
      console.error('[adminService.getRatings] Error:', err);
    }
    return [];
  },

  async deleteRating(ratingId: string): Promise<boolean> {
    const { user } = useAuthStore.getState();
    const adminId = user?.id;
    try {
      const res = await fetch(`/api/admin/ratings/${encodeURIComponent(ratingId)}?adminId=${adminId}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      });
      return res.ok;
    } catch (err) {
      console.error(`[adminService.deleteRating] Error:`, err);
    }
    return false;
  }
};
