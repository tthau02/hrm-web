import dayjs from 'dayjs';

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
