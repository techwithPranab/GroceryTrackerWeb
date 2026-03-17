import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, ShoppingListItem, Priority } from '@/types';

export interface CreateShoppingItemPayload {
  itemName: string;
  quantityNeeded: number;
  unitSize?: number | null;
  unit?: string;
  categoryId?: string | null;
  priority?: Priority;
  notes?: string;
}

export interface UpdateShoppingItemPayload {
  status?: 'pending' | 'purchased';
  quantityNeeded?: number;
  priority?: Priority;
  notes?: string;
}

const shoppingListService = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<PaginatedResponse<ShoppingListItem>>(
      '/shopping-list',
      { params }
    );
    return res.data;
  },

  addItem: async (payload: CreateShoppingItemPayload) => {
    const res = await apiClient.post<ApiResponse<{ item: ShoppingListItem }>>(
      '/shopping-list',
      payload
    );
    return res.data;
  },

  updateItem: async (id: string, payload: UpdateShoppingItemPayload) => {
    const res = await apiClient.put<ApiResponse<{ item: ShoppingListItem }>>(
      `/shopping-list/${id}`,
      payload
    );
    return res.data;
  },

  markPurchased: async (id: string) => {
    return shoppingListService.updateItem(id, { status: 'purchased' });
  },

  markPending: async (id: string) => {
    return shoppingListService.updateItem(id, { status: 'pending' });
  },

  deleteItem: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/shopping-list/${id}`);
    return res.data;
  },

  clearPurchased: async () => {
    const res = await apiClient.delete<ApiResponse<null>>(
      '/shopping-list/clear-purchased'
    );
    return res.data;
  },
};

export default shoppingListService;
