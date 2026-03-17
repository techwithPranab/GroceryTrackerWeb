import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '@/services/dashboardService';
import type { DashboardState } from '@/types';

const initialState: DashboardState = {
  stats: null,
  categoryDistribution: [],
  topItems: [],
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await dashboardService.getStats();
      return res.data!;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchCategoryDistribution = createAsyncThunk(
  'dashboard/fetchCategoryDistribution',
  async (_, { rejectWithValue }) => {
    try {
      const res = await dashboardService.getCategoryDistribution();
      return res.data!.distribution;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch distribution');
    }
  }
);

export const fetchTopItems = createAsyncThunk(
  'dashboard/fetchTopItems',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const res = await dashboardService.getTopItems(limit);
      return res.data!.items;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top items');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCategoryDistribution.fulfilled, (state, action) => {
        state.categoryDistribution = action.payload;
      })
      .addCase(fetchTopItems.fulfilled, (state, action) => {
        state.topItems = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
