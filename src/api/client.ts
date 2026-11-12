import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { mockProducts, mockUsers } from './mockData';
import type { Product, ProductFilterParams } from '@/types';

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
    const token = localStorage.getItem('sasco_token');
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
      localStorage.removeItem('sasco_token');
      localStorage.removeItem('sasco_user');
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

    const mockOk = (data: unknown, status = 200, extra: Record<string, unknown> = {}) => {
      const mockResponse: AxiosResponse = {
        data: { success: true, data, ...extra },
        status,
        statusText: 'OK',
        headers: {},
        config,
      };
      return Promise.reject({ __isMockResponse: true, response: mockResponse });
    };

    if (url.includes('/products') && method === 'get') {
      await delay(300);
      const params: ProductFilterParams = config.params || {};
      let list = [...mockProducts];

      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            (p.declarationNo ?? '').toLowerCase().includes(q)
        );
      }
      if (params.category && params.category !== 'all') {
        list = list.filter((p) => p.category === params.category);
      }
      if (params.warehouse && params.warehouse !== 'all') {
        list = list.filter((p) => p.warehouse === params.warehouse);
      }
      if (params.status && params.status !== 'all') {
        list = list.filter((p) => p.status === params.status);
      }
      return mockOk(list, 200, { total: list.length });
    }

    if (url.includes('/products') && method === 'post') {
      await delay(400);
      const body: Partial<Product> = JSON.parse(config.data || '{}');
      const newProduct: Product = {
        id: `prd-${Date.now()}`,
        sku: body.sku || `SKU-${String(mockProducts.length + 1).padStart(4, '0')}`,
        name: body.name || 'Hàng hóa mới',
        brand: body.brand || '',
        category: body.category || 'liquor',
        warehouse: body.warehouse || 'SGN',
        quantity: Number(body.quantity) || 0,
        unit: body.unit || 'Chai',
        unitPrice: Number(body.unitPrice) || 0,
        status: body.status || 'in_stock',
        importDate: body.importDate || new Date().toISOString().split('T')[0],
        declarationNo: body.declarationNo,
        note: body.note,
      };
      mockProducts.unshift(newProduct);
      return mockOk(newProduct, 201, { message: 'Thêm hàng hóa thành công' });
    }

    if (url.includes('/products/') && method === 'put') {
      await delay(300);
      const id = url.split('/').pop();
      const body: Partial<Product> = JSON.parse(config.data || '{}');
      const index = mockProducts.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockProducts[index] = { ...mockProducts[index], ...body };
        return mockOk(mockProducts[index], 200, { message: 'Cập nhật hàng hóa thành công' });
      }
    }

    if (url.includes('/products/') && method === 'delete') {
      await delay(300);
      const id = url.split('/').pop();
      const index = mockProducts.findIndex((p) => p.id === id);
      if (index !== -1) mockProducts.splice(index, 1);
      return mockOk({ success: index !== -1 }, 200, { message: 'Xóa hàng hóa thành công' });
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
