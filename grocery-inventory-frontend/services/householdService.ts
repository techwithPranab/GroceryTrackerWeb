import apiClient from './apiClient';
import type { ApiResponse, Household, HouseholdMember, Category, Location } from '@/types';

const householdService = {
  create: async (name: string) => {
    const res = await apiClient.post<ApiResponse<{ household: Household }>>(
      '/household',
      { name }
    );
    return res.data;
  },

  get: async () => {
    const res = await apiClient.get<ApiResponse<{ household: Household }>>('/household');
    return res.data;
  },

  getMembers: async () => {
    const res = await apiClient.get<ApiResponse<{ members: HouseholdMember[] }>>(
      '/household/members'
    );
    return res.data;
  },

  invite: async (email: string) => {
    const res = await apiClient.post<ApiResponse<unknown>>('/household/invite', { email });
    return res.data;
  },

  updateMemberRole: async (memberId: string, role: 'admin' | 'member') => {
    const res = await apiClient.patch<ApiResponse<{ household: Household }>>(
      `/household/members/${memberId}/role`,
      { role }
    );
    return res.data;
  },

  getActivity: async (page = 1, limit = 20) => {
    const res = await apiClient.get('/household/activity', { params: { page, limit } });
    return res.data;
  },
};

export const categoryService = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<{ categories: Category[] }>>('/categories');
    return res.data;
  },
  create: async (data: { name: string; color?: string; icon?: string }) => {
    const res = await apiClient.post<ApiResponse<{ category: Category }>>('/categories', data);
    return res.data;
  },
  update: async (id: string, data: Partial<{ name: string; color: string; icon: string }>) => {
    const res = await apiClient.put<ApiResponse<{ category: Category }>>(`/categories/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
    return res.data;
  },
};

export const locationService = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<{ locations: Location[] }>>('/locations');
    return res.data;
  },
  create: async (data: { name: string; description?: string }) => {
    const res = await apiClient.post<ApiResponse<{ location: Location }>>('/locations', data);
    return res.data;
  },
  update: async (id: string, data: Partial<{ name: string; description: string }>) => {
    const res = await apiClient.put<ApiResponse<{ location: Location }>>(`/locations/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/locations/${id}`);
    return res.data;
  },
};

export default householdService;
