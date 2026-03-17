import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, InventoryItem, Unit } from '@/types';

export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  locationId?: string;
  lowStock?: boolean;
  expiring?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateInventoryPayload {
  itemName: string;
  categoryId: string;
  quantity: number;
  unitSize?: number | null;
  unit: Unit;
  minimumThreshold: number;
  expirationDate?: string | null;
  locationId?: string | null;
  notes?: string;
  brand?: string;
}

const inventoryService = {
  getAll: async (params?: InventoryQueryParams) => {
    const res = await apiClient.get<PaginatedResponse<InventoryItem>>(
      '/inventory',
      { params }
    );
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<{ item: InventoryItem }>>(
      `/inventory/${id}`
    );
    return res.data;
  },

  create: async (payload: CreateInventoryPayload) => {
    const res = await apiClient.post<ApiResponse<{ item: InventoryItem }>>(
      '/inventory',
      payload
    );
    return res.data;
  },

  update: async (id: string, payload: Partial<CreateInventoryPayload>) => {
    const res = await apiClient.put<ApiResponse<{ item: InventoryItem }>>(
      `/inventory/${id}`,
      payload
    );
    return res.data;
  },

  updateQuantity: async (id: string, quantity: number) => {
    const res = await apiClient.patch<ApiResponse<{ item: InventoryItem }>>(
      `/inventory/${id}/quantity`,
      { quantity }
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/inventory/${id}`);
    return res.data;
  },

  getExpiring: async (days = 7) => {
    const res = await apiClient.get<ApiResponse<{ items: InventoryItem[] }>>(
      '/inventory/expiring',
      { params: { days } }
    );
    return res.data;
  },
};

export default inventoryService;
