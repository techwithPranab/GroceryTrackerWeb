import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import shoppingListService, { CreateShoppingItemPayload, UpdateShoppingItemPayload } from '@/services/shoppingListService';
import type { ShoppingListState } from '@/types';

const initialState: ShoppingListState = {
  items: [],
  pagination: null,
  isLoading: false,
  error: null,
};

export const fetchShoppingList = createAsyncThunk(
  'shoppingList/fetchAll',
  async (params: { status?: string; page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      return await shoppingListService.getAll(params);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shopping list');
    }
  }
);

export const addShoppingItem = createAsyncThunk(
  'shoppingList/add',
  async (payload: CreateShoppingItemPayload, { rejectWithValue }) => {
    try {
      const res = await shoppingListService.addItem(payload);
      return res.data!.item;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to add item');
    }
  }
);

export const updateShoppingItem = createAsyncThunk(
  'shoppingList/update',
  async ({ id, payload }: { id: string; payload: UpdateShoppingItemPayload }, { rejectWithValue }) => {
    try {
      const res = await shoppingListService.updateItem(id, payload);
      return res.data!.item;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to update item');
    }
  }
);

export const deleteShoppingItem = createAsyncThunk(
  'shoppingList/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await shoppingListService.deleteItem(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to delete item');
    }
  }
);

export const clearPurchasedItems = createAsyncThunk(
  'shoppingList/clearPurchased',
  async (_, { rejectWithValue }) => {
    try {
      await shoppingListService.clearPurchased();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to clear items');
    }
  }
);

const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShoppingList.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchShoppingList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchShoppingList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addShoppingItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateShoppingItem.fulfilled, (state, action) => {
        state.items = state.items.map((i) =>
          i._id === action.payload._id ? action.payload : i
        );
      })
      .addCase(deleteShoppingItem.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      })
      .addCase(clearPurchasedItems.fulfilled, (state) => {
        state.items = state.items.filter((i) => i.status !== 'purchased');
      });
  },
});

export const { clearError } = shoppingListSlice.actions;
export default shoppingListSlice.reducer;
