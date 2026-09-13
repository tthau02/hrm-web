import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi, departmentApi, dashboardApi } from '@/api/endpoints';
import type { Employee, EmployeeFilterParams } from '@/types';
import { message } from 'antd';

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
      message.success('Thêm nhân viên mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
    },
    onError: (err: unknown) => {
      message.error(getErrorMessage(err, 'Không thể thêm nhân viên'));
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
      message.success('Cập nhật thông tin nhân viên thành công!');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
    },
    onError: (err: unknown) => {
      message.error(getErrorMessage(err, 'Không thể cập nhật nhân viên'));
    },
  });
};

// Hook: Delete employee mutation
export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeApi.delete(id),
    onSuccess: () => {
      message.success('Xóa nhân viên thành công!');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
    },
    onError: (err: unknown) => {
      message.error(getErrorMessage(err, 'Không thể xóa nhân viên'));
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
