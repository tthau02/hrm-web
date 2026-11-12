import React, { useMemo } from 'react';
import { DynamicFormSidebar } from '@/components/common';
import type { DynamicFormConfig } from '@/components/common';
import type { Product } from '@/types';
import {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_UNIT_OPTIONS,
  WAREHOUSE_OPTIONS,
} from '@/types';

export interface ProductCreateOrUpdateProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (formData: Partial<Product>) => Promise<void> | void;
  saving?: boolean;
}

export const ProductCreateOrUpdate: React.FC<ProductCreateOrUpdateProps> = ({
  open,
  onClose,
  product,
  onSubmit,
  saving = false,
}) => {
  const formConfig: DynamicFormConfig = useMemo(
    () => ({
      title: 'Thêm mới hàng hóa',
      editTitle: 'Cập nhật hàng hóa',
      isEdit: Boolean(product),
      data: product ?? {
        category: 'liquor',
        warehouse: 'SGN',
        unit: 'Chai',
        status: 'in_stock',
        quantity: 0,
        importDate: new Date().toISOString().split('T')[0],
      },
      fields: [
        { key: 'title_basic', label: 'Thông tin hàng hóa', type: 'title', colSpan: 24 },
        { key: 'sku', label: 'Mã hàng (SKU)', type: 'text', required: true, colSpan: 12 },
        { key: 'brand', label: 'Thương hiệu', type: 'text', required: true, colSpan: 12 },
        { key: 'name', label: 'Tên hàng hóa', type: 'text', required: true, colSpan: 24 },
        {
          key: 'category',
          label: 'Nhóm hàng',
          type: 'select',
          required: true,
          options: PRODUCT_CATEGORY_OPTIONS,
          colSpan: 12,
        },
        {
          key: 'status',
          label: 'Trạng thái',
          type: 'select',
          required: true,
          options: PRODUCT_STATUS_OPTIONS,
          colSpan: 12,
        },
        { key: 'title_stock', label: 'Tồn kho & Giá', type: 'title', colSpan: 24 },
        {
          key: 'warehouse',
          label: 'Kho ngoại quan',
          type: 'select',
          required: true,
          options: WAREHOUSE_OPTIONS,
          colSpan: 12,
        },
        {
          key: 'unit',
          label: 'Đơn vị tính',
          type: 'select',
          required: true,
          options: PRODUCT_UNIT_OPTIONS,
          colSpan: 12,
        },
        { key: 'quantity', label: 'Số lượng tồn', type: 'number', required: true, colSpan: 12 },
        { key: 'unitPrice', label: 'Đơn giá', type: 'money', required: true, colSpan: 12 },
        { key: 'title_customs', label: 'Nhập kho & Hải quan', type: 'title', colSpan: 24 },
        { key: 'importDate', label: 'Ngày nhập kho', type: 'date', required: true, colSpan: 12 },
        { key: 'declarationNo', label: 'Số tờ khai hải quan', type: 'text', colSpan: 12 },
        { key: 'note', label: 'Ghi chú', type: 'textarea', colSpan: 24 },
      ],
    }),
    [product]
  );

  return (
    <DynamicFormSidebar
      config={formConfig}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
    />
  );
};

export default ProductCreateOrUpdate;
