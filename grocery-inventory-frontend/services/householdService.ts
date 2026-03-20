import apiClient from './apiClient';
import type { ApiResponse, Category, Location } from '@/types';

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
