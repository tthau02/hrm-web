import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/api/endpoints';
import type { Product, ProductFilterParams } from '@/types';
import { notify } from '@/components/common';

export const QUERY_KEYS = {
  products: (params?: ProductFilterParams) => ['products', params],
  productDetail: (id: string) => ['product', id],
};

// Hook: Get list of products
export const useProductsQuery = (params?: ProductFilterParams) =>
  useQuery({
    queryKey: QUERY_KEYS.products(params),
    queryFn: () => productApi.getAll(params),
  });

const getErrorMessage = (err: unknown, defaultMsg: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || defaultMsg;
  }
  return defaultMsg;
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) => productApi.create(data),
    onSuccess: () => {
      notify.success('Thêm hàng hóa thành công!', 'Hàng hóa đã được ghi nhận vào kho.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: unknown) => {
      notify.error('Không thể thêm hàng hóa', getErrorMessage(err, 'Đã xảy ra lỗi khi tạo hàng hóa.'));
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productApi.update(id, data),
    onSuccess: () => {
      notify.success('Cập nhật thành công!', 'Thông tin hàng hóa đã được lưu.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: unknown) => {
      notify.error('Không thể cập nhật hàng hóa', getErrorMessage(err, 'Đã xảy ra lỗi khi cập nhật.'));
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      notify.success('Xóa hàng hóa thành công!', 'Hàng hóa đã được xóa khỏi danh mục.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: unknown) => {
      notify.error('Không thể xóa hàng hóa', getErrorMessage(err, 'Đã xảy ra lỗi khi xóa hàng hóa.'));
    },
  });
};
