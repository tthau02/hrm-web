import { PRODUCT_CATEGORY_OPTIONS, WAREHOUSE_OPTIONS } from '@/types';

const toLabelMap = (options: { label: string; value: string }[]) =>
  Object.fromEntries(options.map((o) => [o.value, o.label])) as Record<string, string>;

export const CATEGORY_LABELS = toLabelMap(PRODUCT_CATEGORY_OPTIONS);
export const WAREHOUSE_LABELS = toLabelMap(WAREHOUSE_OPTIONS);

export const getCategoryLabel = (value?: string) => (value && CATEGORY_LABELS[value]) || value || '-';
export const getWarehouseLabel = (value?: string) => (value && WAREHOUSE_LABELS[value]) || value || '-';
