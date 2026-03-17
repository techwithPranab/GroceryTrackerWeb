import apiClient from './apiClient';
import type { ApiResponse, User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

const authService = {
  register: async (payload: RegisterPayload) => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>(
      '/auth/register',
      payload
    );
    return res.data;
  },

  login: async (payload: LoginPayload) => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>(
      '/auth/login',
      payload
    );
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data;
  },

  updateProfile: async (data: Partial<Pick<User, 'name'>>) => {
    const res = await apiClient.put<ApiResponse<{ user: User }>>('/auth/me', data);
    return res.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await apiClient.put<ApiResponse<null>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('grocery_token');
    localStorage.removeItem('grocery_user');
  },
};

export default authService;
