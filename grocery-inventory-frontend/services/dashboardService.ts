import apiClient from './apiClient';
import type { ApiResponse, DashboardStats, CategoryDistribution } from '@/types';

const dashboardService = {
  getStats: async () => {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return res.data;
  },

  getCategoryDistribution: async () => {
    const res = await apiClient.get<
      ApiResponse<{ distribution: CategoryDistribution[] }>
    >('/dashboard/category-distribution');
    return res.data;
  },

  getTopItems: async (limit = 10) => {
    const res = await apiClient.get<
      ApiResponse<{
        items: Array<{
          _id: string;
          itemName: string;
          quantity: number;
          unit: string;
          activityCount: number;
        }>;
      }>
    >('/dashboard/top-items', { params: { limit } });
    return res.data;
  },
};

export default dashboardService;
