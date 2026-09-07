import type { User, Item, ItemRequest, Report } from '../types';

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

export const adminService = {
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/admin/users');
    if (!res.ok) {
      throw new Error(`Failed to load users (${res.status})`);
    }
    const data = await res.json();
    return data.users || [];
  },

  async suspendUser(payload: SuspendUserPayload): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/users/${payload.userId}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duration: payload.duration,
        customDays: payload.customDays,
        reason: payload.reason,
        message: payload.message,
        adminId: payload.adminId || 'user-5',
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: adminId || 'user-5',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to unsuspend user');
    }
    return data;
  },

  async getPosts(): Promise<Item[]> {
    const res = await fetch('/api/admin/posts');
    if (!res.ok) {
      throw new Error(`Failed to load posts (${res.status})`);
    }
    const data = await res.json();
    return data.posts || [];
  },

  async removePost(payload: RemovePostPayload): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/posts/${payload.itemId}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: payload.reason,
        message: payload.message,
        adminId: payload.adminId || 'user-5',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to remove post');
    }
    return data;
  },

  async getRequests(): Promise<ItemRequest[]> {
    const res = await fetch('/api/admin/requests');
    if (!res.ok) {
      throw new Error(`Failed to load requests (${res.status})`);
    }
    const data = await res.json();
    return data.requests || [];
  },

  async removeRequest(payload: RemoveRequestPayload): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/requests/${payload.requestId}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: payload.reason,
        message: payload.message,
        adminId: payload.adminId || 'user-5',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to remove request');
    }
    return data;
  },

  async getReports(): Promise<Report[]> {
    const res = await fetch('/api/admin/reports');
    if (!res.ok) {
      throw new Error(`Failed to load reports (${res.status})`);
    }
    const data = await res.json();
    return data.reports || [];
  },

  async resolveReport(payload: ResolveReportPayload): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/reports/${payload.reportId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: payload.action,
        message: payload.message,
        adminId: payload.adminId || 'user-5',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to resolve report');
    }
    return data;
  },
};
