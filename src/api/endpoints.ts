import { apiClient } from './client';
import type {
  ApiResponse,
  Department,
  Employee,
  EmployeeFilterParams,
  DashboardStats,
  User,
} from '@/types';

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

// Employees API
export const employeeApi = {
  getAll: async (params?: EmployeeFilterParams) => {
    const res = await apiClient.get<ApiResponse<Employee[]>>('/employees', {
      params,
    });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Employee>>(`/employees/${id}`);
    return res.data;
  },
  create: async (data: Partial<Employee>) => {
    const res = await apiClient.post<ApiResponse<Employee>>('/employees', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Employee>) => {
    const res = await apiClient.put<ApiResponse<Employee>>(`/employees/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/employees/${id}`
    );
    return res.data;
  },
};

// Departments API
export const departmentApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<Department[]>>('/departments');
    return res.data;
  },
};

// Dashboard Stats API
export const dashboardApi = {
  getStats: async () => {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return res.data;
  },
};
