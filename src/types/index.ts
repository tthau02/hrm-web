export type Role = 'admin' | 'warehouse_manager' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  department?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Duty-free goods (sample CRUD entity used to validate the UI)
// ---------------------------------------------------------------------------
export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_hold';

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  in_stock: 'Còn hàng',
  low_stock: 'Sắp hết',
  out_of_stock: 'Hết hàng',
  on_hold: 'Tạm giữ',
};

export const PRODUCT_STATUS_OPTIONS = (
  Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]
).map((value) => ({ label: PRODUCT_STATUS_LABELS[value], value }));

export const PRODUCT_CATEGORY_OPTIONS = [
  { label: 'Rượu & Đồ uống', value: 'liquor' },
  { label: 'Thuốc lá', value: 'tobacco' },
  { label: 'Nước hoa', value: 'perfume' },
  { label: 'Mỹ phẩm', value: 'cosmetics' },
  { label: 'Socola & Bánh kẹo', value: 'confectionery' },
  { label: 'Đồng hồ & Phụ kiện', value: 'accessories' },
];

export const WAREHOUSE_OPTIONS = [
  { label: 'Kho ngoại quan SGN', value: 'SGN' },
  { label: 'Kho ngoại quan DAD', value: 'DAD' },
  { label: 'Kho ngoại quan PQC', value: 'PQC' },
];

export const PRODUCT_UNIT_OPTIONS = [
  { label: 'Chai', value: 'Chai' },
  { label: 'Hộp', value: 'Hộp' },
  { label: 'Cây', value: 'Cây' },
  { label: 'Thùng', value: 'Thùng' },
  { label: 'Cái', value: 'Cái' },
];

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  warehouse: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  status: ProductStatus;
  importDate: string;
  declarationNo?: string;
  note?: string;
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  warehouse?: string;
  status?: ProductStatus | 'all';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}
