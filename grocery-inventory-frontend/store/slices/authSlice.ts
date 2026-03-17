import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService, { LoginPayload, RegisterPayload } from '@/services/authService';
import type { AuthState, User } from '@/types';

const loadFromStorage = (): { user: User | null; token: string | null } => {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const token = localStorage.getItem('grocery_token');
    const userStr = localStorage.getItem('grocery_user');
    const user = userStr ? (JSON.parse(userStr) as User) : null;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
};

const { user: storedUser, token: storedToken } = loadFromStorage();

const initialState: AuthState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const res = await authService.register(payload);
      return res.data!;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await authService.login(payload);
      return res.data!;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.getProfile();
      return res.data!.user;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('grocery_token');
        localStorage.removeItem('grocery_user');
      }
    },
    clearError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('grocery_user', JSON.stringify(action.payload));
      }
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('grocery_token', action.payload.token);
        localStorage.setItem('grocery_user', JSON.stringify(action.payload.user));
      }
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('grocery_token', action.payload.token);
        localStorage.setItem('grocery_user', JSON.stringify(action.payload.user));
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Profile
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('grocery_user', JSON.stringify(action.payload));
      }
    });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
