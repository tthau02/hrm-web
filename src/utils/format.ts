import dayjs from 'dayjs';
import type { EmployeeStatus } from '@/types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date, format = 'DD/MM/YYYY'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const getStatusConfig = (status: EmployeeStatus) => {
  switch (status) {
    case 'active':
      return {
        color: 'success',
        text: 'Chính thức',
        badgeStatus: 'success' as const,
      };
    case 'probation':
      return {
        color: 'warning',
        text: 'Thử việc',
        badgeStatus: 'warning' as const,
      };
    case 'on_leave':
      return {
        color: 'processing',
        text: 'Nghỉ phép',
        badgeStatus: 'processing' as const,
      };
    case 'resigned':
      return {
        color: 'default',
        text: 'Đã thôi việc',
        badgeStatus: 'default' as const,
      };
    default:
      return {
        color: 'default',
        text: status,
        badgeStatus: 'default' as const,
      };
  }
};
