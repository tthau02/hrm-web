import { apiClient } from './client';
import type { ApiResponse, Product, ProductFilterParams, User } from '@/types';

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      credentials
    );
    return res.data;
  },
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return res.data;
  },
};

// Products (duty-free goods) API
export const productApi = {
  getAll: async (params?: ProductFilterParams) => {
    const res = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data;
  },
  create: async (data: Partial<Product>) => {
    const res = await apiClient.post<ApiResponse<Product>>('/products', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Product>) => {
    const res = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/products/${id}`);
    return res.data;
  },
};
