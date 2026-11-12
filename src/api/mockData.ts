import type { Product, User } from '@/types';

export const mockUsers: (User & { password: string })[] = [
  {
    id: 'usr-1',
    name: 'Quản trị hệ thống',
    email: 'admin@sasco.vn',
    password: 'password123',
    role: 'admin',
    department: 'Ban Quản trị',
  },
  {
    id: 'usr-2',
    name: 'Quản lý kho',
    email: 'warehouse@sasco.vn',
    password: 'password123',
    role: 'warehouse_manager',
    department: 'Kho ngoại quan',
  },
];

export const mockProducts: Product[] = [
  { id: 'prd-1', sku: 'LIQ-0001', name: 'Rượu Whisky Chivas Regal 18 năm 700ml', brand: 'Chivas Regal', category: 'liquor', warehouse: 'SGN', quantity: 240, unit: 'Chai', unitPrice: 1890000, status: 'in_stock', importDate: '2026-10-12', declarationNo: 'TK-107235541', note: 'Hàng nhập từ Scotland.' },
  { id: 'prd-2', sku: 'LIQ-0002', name: 'Rượu Cognac Hennessy VSOP 700ml', brand: 'Hennessy', category: 'liquor', warehouse: 'SGN', quantity: 18, unit: 'Chai', unitPrice: 1650000, status: 'low_stock', importDate: '2026-09-28', declarationNo: 'TK-107198842' },
  { id: 'prd-3', sku: 'TOB-0001', name: 'Thuốc lá Marlboro Gold (cây 10 gói)', brand: 'Marlboro', category: 'tobacco', warehouse: 'DAD', quantity: 520, unit: 'Cây', unitPrice: 320000, status: 'in_stock', importDate: '2026-10-20', declarationNo: 'TK-107260013' },
  { id: 'prd-4', sku: 'PRF-0001', name: 'Nước hoa Chanel Coco Mademoiselle 100ml', brand: 'Chanel', category: 'perfume', warehouse: 'SGN', quantity: 64, unit: 'Chai', unitPrice: 3250000, status: 'in_stock', importDate: '2026-10-05', declarationNo: 'TK-107221377' },
  { id: 'prd-5', sku: 'PRF-0002', name: 'Nước hoa Dior Sauvage EDT 100ml', brand: 'Dior', category: 'perfume', warehouse: 'PQC', quantity: 0, unit: 'Chai', unitPrice: 2780000, status: 'out_of_stock', importDate: '2026-08-14', declarationNo: 'TK-107102296' },
  { id: 'prd-6', sku: 'COS-0001', name: 'Kem dưỡng Estée Lauder Advanced Night Repair 50ml', brand: 'Estée Lauder', category: 'cosmetics', warehouse: 'SGN', quantity: 96, unit: 'Hộp', unitPrice: 2450000, status: 'in_stock', importDate: '2026-10-18', declarationNo: 'TK-107254601' },
  { id: 'prd-7', sku: 'COS-0002', name: "Son môi Lancôme L'Absolu Rouge", brand: 'Lancôme', category: 'cosmetics', warehouse: 'DAD', quantity: 12, unit: 'Cái', unitPrice: 980000, status: 'low_stock', importDate: '2026-09-30' },
  { id: 'prd-8', sku: 'CON-0001', name: 'Socola Toblerone hộp quà 360g', brand: 'Toblerone', category: 'confectionery', warehouse: 'PQC', quantity: 380, unit: 'Hộp', unitPrice: 215000, status: 'in_stock', importDate: '2026-11-02', declarationNo: 'TK-107288140' },
  { id: 'prd-9', sku: 'CON-0002', name: 'Socola Ferrero Rocher 24 viên', brand: 'Ferrero', category: 'confectionery', warehouse: 'SGN', quantity: 150, unit: 'Hộp', unitPrice: 340000, status: 'on_hold', importDate: '2026-11-08', note: 'Chờ kiểm tra chất lượng lô hàng.' },
  { id: 'prd-10', sku: 'ACC-0001', name: 'Kính mát Ray-Ban Aviator Classic', brand: 'Ray-Ban', category: 'accessories', warehouse: 'DAD', quantity: 45, unit: 'Cái', unitPrice: 3890000, status: 'in_stock', importDate: '2026-10-25', declarationNo: 'TK-107270529' },
  { id: 'prd-11', sku: 'LIQ-0003', name: 'Rượu Vodka Absolut Blue 1L', brand: 'Absolut', category: 'liquor', warehouse: 'PQC', quantity: 300, unit: 'Chai', unitPrice: 520000, status: 'in_stock', importDate: '2026-10-09', declarationNo: 'TK-107229984' },
  { id: 'prd-12', sku: 'LIQ-0004', name: 'Rượu vang Penfolds Bin 389 750ml', brand: 'Penfolds', category: 'liquor', warehouse: 'SGN', quantity: 8, unit: 'Chai', unitPrice: 2190000, status: 'low_stock', importDate: '2026-09-15', declarationNo: 'TK-107163350' },
];
