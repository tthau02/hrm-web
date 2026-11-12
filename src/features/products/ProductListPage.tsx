import React, { useState, useMemo, useCallback } from 'react';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  FilterBar,
  CommonTable,
  notify,
  useCrudModal,
} from '@/components/common';
import type { CommonTableColumn } from '@/components/common';
import {
  useProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '@/hooks/useProductQuery';
import {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  WAREHOUSE_OPTIONS,
} from '@/types';
import type { Product, ProductStatus } from '@/types';
import { getCategoryLabel, getWarehouseLabel } from './productOptions';
import { ProductView } from './ProductView';
import { ProductCreateOrUpdate } from './ProductCreateOrUpdate';

export const ProductListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [warehouse, setWarehouse] = useState<string>('all');
  const [status, setStatus] = useState<ProductStatus | 'all'>('all');

  const {
    viewOpen,
    selectedRecord: viewingProduct,
    handleOpenView,
    handleCloseView,
    formOpen,
    editingRecord: editingProduct,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseForm,
    handleNavigate,
    syncUpdatedRecord,
  } = useCrudModal<Product>();

  const { data: response, isLoading, refetch } = useProductsQuery({
    search,
    category: category === 'all' ? undefined : category,
    warehouse: warehouse === 'all' ? undefined : warehouse,
    status: status === 'all' ? undefined : status,
  });

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();

  const products = useMemo(() => response?.data ?? [], [response?.data]);

  const handleFormSubmit = async (formData: Partial<Product>) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, data: formData });
      syncUpdatedRecord(formData, 'id');
    } else {
      await createMutation.mutateAsync(formData);
    }
    handleCloseForm();
  };

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
      if (viewingProduct?.id === id) {
        handleCloseView();
      }
    },
    [deleteMutation, viewingProduct?.id, handleCloseView]
  );

  const columns: CommonTableColumn<Product>[] = useMemo(
    () => [
      {
        title: 'Hàng hóa',
        key: 'name',
        width: 280,
        action: (record) => handleOpenView(record),
        renderTitleSubtitle: (record) => ({
          title: record.name,
          subtitle: `${record.sku} • ${record.brand}`,
        }),
      },
      {
        title: 'Nhóm hàng',
        key: 'category',
        width: 150,
        render: (_v, record) => getCategoryLabel(record.category),
      },
      {
        title: 'Kho',
        key: 'warehouse',
        width: 170,
        render: (_v, record) => getWarehouseLabel(record.warehouse),
      },
      {
        title: 'Tồn kho',
        key: 'quantity',
        dataIndex: 'quantity',
        width: 120,
        mono: true,
        bold: true,
        allowSort: true,
        render: (_v, record) => `${record.quantity.toLocaleString('vi-VN')} ${record.unit}`,
      },
      {
        title: 'Đơn giá',
        dataIndex: 'unitPrice',
        type: 'money',
        width: 140,
        allowSort: true,
      },
      {
        title: 'Ngày nhập kho',
        dataIndex: 'importDate',
        type: 'date',
        width: 140,
        allowSort: true,
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        type: 'status',
        width: 120,
        allowSort: true,
      },
    ],
    [handleOpenView]
  );

  return (
    <div>
      <PageHeader
        title="Hàng hóa miễn thuế"
        primaryAction={{
          key: 'add-product',
          label: 'Thêm hàng hóa',
          icon: <PlusOutlined />,
          onClick: handleOpenAdd,
        }}
        secondaryActions={[
          {
            key: 'export-excel',
            label: 'Xuất Excel',
            icon: <ExportOutlined />,
            onClick: () =>
              notify.success({
                title: 'Xuất Excel thành công',
                description: 'Danh sách hàng hóa đã được trích xuất thành tệp Excel.',
              }),
          },
        ]}
      />

      <FilterBar
        fields={[
          { name: 'search', type: 'search', placeholder: 'Tìm theo tên, SKU, thương hiệu...', width: 280 },
          { name: 'category', type: 'select', placeholder: 'Tất cả nhóm hàng', width: 170, options: PRODUCT_CATEGORY_OPTIONS },
          { name: 'warehouse', type: 'select', placeholder: 'Tất cả kho', width: 170, options: WAREHOUSE_OPTIONS },
          { name: 'status', type: 'select', placeholder: 'Tất cả trạng thái', width: 170, options: PRODUCT_STATUS_OPTIONS },
        ]}
        values={{ search, category, warehouse, status }}
        onChange={(name, val) => {
          if (name === 'search') setSearch(String(val ?? ''));
          if (name === 'category') setCategory(String(val ?? 'all'));
          if (name === 'warehouse') setWarehouse(String(val ?? 'all'));
          if (name === 'status') setStatus((val as ProductStatus) || 'all');
        }}
        onSearch={() => refetch()}
        onReset={() => {
          setSearch('');
          setCategory('all');
          setWarehouse('all');
          setStatus('all');
          refetch();
        }}
        loading={isLoading}
      />

      <CommonTable<Product>
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1260 }}
        pagination={{
          pageSize: 8,
          showTotal: (total) => `Tổng cộng ${total}`,
        }}
        actions={(record) => [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => handleOpenView(record),
          },
          {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <EditOutlined />,
            onClick: () => handleOpenEdit(record),
          },
          {
            key: 'delete',
            label: 'Xóa hàng hóa',
            icon: <DeleteOutlined />,
            danger: true,
            confirm: {
              title: 'Xác nhận xóa',
              description: `Bạn có chắc muốn xóa "${record.name}"? Thao tác này không thể hoàn tác.`,
              okText: 'Xóa hàng hóa',
              cancelText: 'Hủy bỏ',
              onConfirm: () => handleDelete(record.id),
            },
          },
        ]}
      />

      <ProductView
        open={viewOpen}
        onClose={handleCloseView}
        product={viewingProduct}
        products={products}
        onEdit={(p) => {
          handleCloseView();
          handleOpenEdit(p);
        }}
        onDelete={handleDelete}
        onNavigate={(idx) => handleNavigate(idx, products)}
      />

      <ProductCreateOrUpdate
        open={formOpen}
        onClose={handleCloseForm}
        product={editingProduct}
        onSubmit={handleFormSubmit}
        saving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default ProductListPage;
