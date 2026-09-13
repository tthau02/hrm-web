import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import {
  mockDepartments,
  mockEmployees,
  getMockDashboardStats,
  mockUsers,
} from './mockData';
import type { Employee, EmployeeFilterParams } from '@/types';

// Create base Axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('hrm_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global error handler
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hrm_token');
      localStorage.removeItem('hrm_user');
      // Redirect to login if needed
    }
    return Promise.reject(error);
  }
);

/**
 * Lightweight Built-in Mock Adapter for seamless development & demo
 * If VITE_USE_MOCK !== 'false', this intercepts matching requests and responds with mock data
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

if (USE_MOCK) {
  // Custom adapter wrapper for mock handling
  apiClient.interceptors.request.use(async (config) => {
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();

    // Helper to simulate network latency
    const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

    // Handle Mock Routes
    if (url.includes('/auth/login') && method === 'post') {
      await delay(400);
      const { email, password } = JSON.parse(config.data || '{}');
      const user = mockUsers.find((u) => u.email === email && u.password === password);
      if (user) {
        const userInfo = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          avatar: user.avatar,
        };
        const mockResponse: AxiosResponse = {
          data: {
            success: true,
            data: { user: userInfo, token: 'mock-jwt-token-xyz-123456' },
            message: 'Đăng nhập thành công',
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
        return Promise.reject({ __isMockResponse: true, response: mockResponse });
      }
      return Promise.reject({
        response: {
          data: { success: false, message: 'Email hoặc mật khẩu không chính xác' },
          status: 400,
        },
      });
    }

    if (url.includes('/dashboard/stats') && method === 'get') {
      await delay(250);
      const mockResponse: AxiosResponse = {
        data: {
          success: true,
          data: getMockDashboardStats(),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
      return Promise.reject({ __isMockResponse: true, response: mockResponse });
    }

    if (url.includes('/departments') && method === 'get') {
      await delay(200);
      const mockResponse: AxiosResponse = {
        data: {
          success: true,
          data: mockDepartments,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
      return Promise.reject({ __isMockResponse: true, response: mockResponse });
    }

    if (url.includes('/employees') && method === 'get') {
      await delay(300);
      const params: EmployeeFilterParams = config.params || {};
      let list = [...mockEmployees];

      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (e) =>
            e.fullName.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q) ||
            e.code.toLowerCase().includes(q) ||
            e.position.toLowerCase().includes(q)
        );
      }
      if (params.departmentId && params.departmentId !== 'all') {
        list = list.filter((e) => e.departmentId === params.departmentId);
      }
      if (params.status && params.status !== 'all') {
        list = list.filter((e) => e.status === params.status);
      }

      const mockResponse: AxiosResponse = {
        data: {
          success: true,
          data: list,
          total: list.length,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
      return Promise.reject({ __isMockResponse: true, response: mockResponse });
    }

    if (url.includes('/employees') && method === 'post') {
      await delay(400);
      const body: Partial<Employee> = JSON.parse(config.data || '{}');
      const dept = mockDepartments.find((d) => d.id === body.departmentId);
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        code: `EMP-${String(mockEmployees.length + 1).padStart(3, '0')}`,
        fullName: body.fullName || 'Nhân viên mới',
        email: body.email || 'nv@hrm.vn',
        phone: body.phone || '0900000000',
        departmentId: body.departmentId || 'dept-1',
        departmentName: dept ? dept.name : 'Phòng CNTT',
        position: body.position || 'Nhân viên',
        status: body.status || 'probation',
        salary: Number(body.salary) || 15000000,
        joinDate: body.joinDate || new Date().toISOString().split('T')[0],
        avatar: body.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        address: body.address || 'Hà Nội',
      };
      mockEmployees.unshift(newEmp);

      const mockResponse: AxiosResponse = {
        data: {
          success: true,
          data: newEmp,
          message: 'Tạo nhân viên mới thành công',
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
      };
      return Promise.reject({ __isMockResponse: true, response: mockResponse });
    }

    if (url.includes('/employees/') && method === 'put') {
      await delay(300);
      const id = url.split('/').pop();
      const body: Partial<Employee> = JSON.parse(config.data || '{}');
      const index = mockEmployees.findIndex((e) => e.id === id);
      if (index !== -1) {
        const dept = mockDepartments.find((d) => d.id === body.departmentId);
        mockEmployees[index] = {
          ...mockEmployees[index],
          ...body,
          departmentName: dept ? dept.name : mockEmployees[index].departmentName,
        };
        const mockResponse: AxiosResponse = {
          data: {
            success: true,
            data: mockEmployees[index],
            message: 'Cập nhật nhân viên thành công',
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
        return Promise.reject({ __isMockResponse: true, response: mockResponse });
      }
    }

    if (url.includes('/employees/') && method === 'delete') {
      await delay(300);
      const id = url.split('/').pop();
      const initialLen = mockEmployees.length;
      const filtered = mockEmployees.filter((e) => e.id !== id);
      mockEmployees.length = 0;
      mockEmployees.push(...filtered);

      const mockResponse: AxiosResponse = {
        data: {
          success: filtered.length < initialLen,
          message: 'Xóa nhân viên thành công',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
      return Promise.reject({ __isMockResponse: true, response: mockResponse });
    }

    return config;
  });

  // Response interceptor to catch mock responses
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error && error.__isMockResponse) {
        return Promise.resolve(error.response);
      }
      return Promise.reject(error);
    }
  );
}
