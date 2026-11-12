import React, { useMemo } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { DynamicViewSidebar } from '@/components/common';
import type { DynamicViewConfig } from '@/components/common';
import type { Product } from '@/types';
import { getCategoryLabel, getWarehouseLabel } from './productOptions';

export interface ProductViewProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onNavigate: (index: number) => void;
}

export const ProductView: React.FC<ProductViewProps> = ({
  open,
  onClose,
  product,
  products,
  onEdit,
  onDelete,
  onNavigate,
}) => {
  const viewConfig: DynamicViewConfig<Product> = useMemo(
    () => ({
      title: product ? product.name : 'Chi tiết hàng hóa',
      subtitle: product ? `${product.sku} • ${product.brand}` : undefined,
      data: product,
      tabs: [
        {
          key: 'general',
          label: 'Thông tin chung',
          fields: [
            { key: 'title_basic', type: 'title', titleConfig: { text: 'Thông tin hàng hóa', divider: true }, colSpan: 24 },
            { key: 'sku', label: 'Mã hàng (SKU)', type: 'badge', colSpan: 6 },
            { key: 'status', label: 'Trạng thái', type: 'status', colSpan: 6 },
            { key: 'brand', label: 'Thương hiệu', type: 'text', colSpan: 6 },
            {
              key: 'category',
              label: 'Nhóm hàng',
              type: 'text',
              colSpan: 6,
              render: (_v, d) => getCategoryLabel(d?.category),
            },
            { key: 'title_stock', type: 'title', titleConfig: { text: 'Tồn kho & Giá', divider: true }, colSpan: 24 },
            {
              key: 'warehouse',
              label: 'Kho ngoại quan',
              type: 'text',
              colSpan: 6,
              render: (_v, d) => getWarehouseLabel(d?.warehouse),
            },
            {
              key: 'quantity',
              label: 'Số lượng tồn',
              type: 'text',
              colSpan: 6,
              render: (_v, d) => (d ? `${d.quantity.toLocaleString('vi-VN')} ${d.unit}` : '-'),
            },
            { key: 'unitPrice', label: 'Đơn giá', type: 'money', colSpan: 6 },
            {
              key: 'totalValue',
              label: 'Giá trị tồn kho',
              type: 'money',
              colSpan: 6,
              render: (_v, d) => (d ? d.quantity * d.unitPrice : 0),
            },
            { key: 'title_customs', type: 'title', titleConfig: { text: 'Nhập kho & Hải quan', divider: true }, colSpan: 24 },
            { key: 'importDate', label: 'Ngày nhập kho', type: 'date', colSpan: 12 },
            { key: 'declarationNo', label: 'Số tờ khai hải quan', type: 'text', colSpan: 12 },
            { key: 'note', label: 'Ghi chú', type: 'textarea', placeholder: 'Không có ghi chú', colSpan: 24 },
          ],
        },
      ],
      actions: [
        {
          key: 'edit',
          label: 'Chỉnh sửa',
          icon: <EditOutlined />,
          type: 'primary',
          onClick: (data) => onEdit(data),
        },
        {
          key: 'delete',
          label: 'Xóa hàng hóa',
          icon: <DeleteOutlined />,
          danger: true,
          confirm: {
            title: 'Xóa hàng hóa',
            description: `Bạn có chắc chắn muốn xóa ${product?.name}?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
          },
          onClick: (data) => onDelete(data.id),
        },
      ],
    }),
    [product, onEdit, onDelete]
  );

  return (
    <DynamicViewSidebar<Product>
      config={viewConfig}
      open={open}
      onClose={onClose}
      data={product}
      navigationIds={products.map((p) => p.id)}
      currentIndex={products.findIndex((p) => p.id === product?.id)}
      totalCount={products.length}
      onNavigate={(_id, idx) => onNavigate(idx)}
    />
  );
};

export default ProductView;
