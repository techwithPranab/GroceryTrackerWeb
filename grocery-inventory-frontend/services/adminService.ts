import apiClient from './apiClient';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalInventoryItems: number;
  totalShoppingItems: number;
  totalActivityLogs: number;
  newUsersToday: number;
  recentActivity: AdminActivityLog[];
}

export interface AdminActivityLog {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  action: string;
  details: string;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'superadmin';
  inventoryCount?: number;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

// ── Service ──────────────────────────────────────────────────────────────────

const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const res = await apiClient.get('/admin/stats');
    const payload = res.data.data; // { stats: {...}, recentActivity: [...] }
    return {
      totalUsers:          payload.stats.totalUsers,
      totalInventoryItems: payload.stats.totalInventory,
      totalShoppingItems:  payload.stats.totalShopping,
      totalActivityLogs:   payload.stats.totalActivity,
      newUsersToday:       payload.stats.newUsersToday,
      recentActivity:      payload.recentActivity,
    };
  },

  getUsers: async (params: UsersQuery = {}): Promise<AdminUsersResponse> => {
    const res = await apiClient.get('/admin/users', { params });
    return res.data.data;
  },

  updateUser: async (
    id: string,
    data: { name?: string; role?: string }
  ): Promise<AdminUser> => {
    const res = await apiClient.put(`/admin/users/${id}`, data);
    return res.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },
};

export default adminService;
