import apiClient from './apiClient';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalHouseholds: number;
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
  householdId: { _id: string; name: string } | null;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface AdminHousehold {
  _id: string;
  name: string;
  createdBy: { _id: string; name: string; email: string } | null;
  members: string[];
  inventoryCount: number;
  createdAt: string;
}

export interface AdminHouseholdsResponse {
  households: AdminHousehold[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface HouseholdsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

// ── Service ──────────────────────────────────────────────────────────────────

const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const res = await apiClient.get('/admin/stats');
    const payload = res.data.data; // { stats: {...}, recentActivity: [...] }
    return {
      totalUsers:         payload.stats.totalUsers,
      totalHouseholds:    payload.stats.totalHouseholds,
      totalInventoryItems:payload.stats.totalInventory,
      totalShoppingItems: payload.stats.totalShopping,
      totalActivityLogs:  payload.stats.totalActivity,
      newUsersToday:      payload.stats.newUsersToday,
      recentActivity:     payload.recentActivity,
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

  getHouseholds: async (
    params: HouseholdsQuery = {}
  ): Promise<AdminHouseholdsResponse> => {
    const res = await apiClient.get('/admin/households', { params });
    return res.data.data;
  },

  deleteHousehold: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/households/${id}`);
  },
};

export default adminService;
