import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi, departmentApi, dashboardApi } from '@/api/endpoints';
import type { Employee, EmployeeFilterParams } from '@/types';
import { notify } from '@/components/common';

export const QUERY_KEYS = {
  employees: (params?: EmployeeFilterParams) => ['employees', params],
  employeeDetail: (id: string) => ['employee', id],
  departments: ['departments'],
  dashboardStats: ['dashboardStats'],
};

// Hook: Get list of employees
export const useEmployeesQuery = (params?: EmployeeFilterParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.employees(params),
    queryFn: () => employeeApi.getAll(params),
  });
};

// Hook: Get single employee
export const useEmployeeQuery = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.employeeDetail(id),
    queryFn: () => employeeApi.getById(id),
    enabled: Boolean(id),
  });
};

const getErrorMessage = (err: unknown, defaultMsg: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || defaultMsg;
  }
  return defaultMsg;
};

// Hook: Create employee mutation
export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Employee>) => employeeApi.create(data),
    onSuccess: () => {
      notify.success('Thêm nhân viên mới thành công!', 'Hồ sơ nhân viên đã được thêm vào hệ thống.');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
    },
    onError: (err: unknown) => {
      notify.error('Không thể thêm nhân viên', getErrorMessage(err, 'Đã xảy ra lỗi khi tạo nhân viên.'));
    },
  });
};

// Hook: Update employee mutation
export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      employeeApi.update(id, data),
    onSuccess: () => {
      notify.success('Cập nhật thông tin thành công!', 'Dữ liệu nhân viên đã được lưu.');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
    },
    onError: (err: unknown) => {
      notify.error('Không thể cập nhật nhân viên', getErrorMessage(err, 'Đã xảy ra lỗi khi cập nhật.'));
    },
  });
};

// Hook: Delete employee mutation
export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeApi.delete(id),
    onSuccess: () => {
      notify.success('Xóa nhân viên thành công!', 'Hồ sơ nhân sự đã được xóa khỏi hệ thống.');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
    },
    onError: (err: unknown) => {
      notify.error('Không thể xóa nhân viên', getErrorMessage(err, 'Đã xảy ra lỗi khi xóa nhân viên.'));
    },
  });
};

// Hook: Get departments
export const useDepartmentsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.departments,
    queryFn: () => departmentApi.getAll(),
  });
};

// Hook: Get dashboard statistics
export const useDashboardStatsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: () => dashboardApi.getStats(),
  });
};
