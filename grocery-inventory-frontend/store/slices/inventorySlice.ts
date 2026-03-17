import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inventoryService, { CreateInventoryPayload, InventoryQueryParams } from '@/services/inventoryService';
import type { InventoryState, InventoryItem } from '@/types';

const initialState: InventoryState = {
  items: [],
  pagination: null,
  isLoading: false,
  error: null,
  selectedItem: null,
};

export const fetchInventory = createAsyncThunk(
  'inventory/fetchAll',
  async (params: InventoryQueryParams | undefined, { rejectWithValue }) => {
    try {
      return await inventoryService.getAll(params);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory');
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  'inventory/create',
  async (payload: CreateInventoryPayload, { rejectWithValue }) => {
    try {
      const res = await inventoryService.create(payload);
      return res.data!.item;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to create item');
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/update',
  async ({ id, payload }: { id: string; payload: Partial<CreateInventoryPayload> }, { rejectWithValue }) => {
    try {
      const res = await inventoryService.update(id, payload);
      return res.data!.item;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to update item');
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  'inventory/updateQuantity',
  async ({ id, quantity }: { id: string; quantity: number }, { rejectWithValue }) => {
    try {
      const res = await inventoryService.updateQuantity(id, quantity);
      return res.data!.item;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to update quantity');
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await inventoryService.delete(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to delete item');
    }
  }
);

const replaceItem = (items: InventoryItem[], updated: InventoryItem) =>
  items.map((i) => (i._id === updated._id ? updated : i));

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setSelectedItem(state, action) {
      state.selectedItem = action.payload;
    },
    clearSelectedItem(state) {
      state.selectedItem = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (state.pagination) state.pagination.total += 1;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.items = replaceItem(state.items, action.payload);
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.items = replaceItem(state.items, action.payload);
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
        if (state.pagination) state.pagination.total -= 1;
      });
  },
});

export const { setSelectedItem, clearSelectedItem, clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
