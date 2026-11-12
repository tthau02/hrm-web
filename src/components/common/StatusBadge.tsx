import React from 'react';
import type { ProductStatus } from '@/types';
import { PRODUCT_STATUS_LABELS } from '@/types';
import { useTranslation } from '@/locales';

export interface StatusBadgeProps {
  status: ProductStatus | string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Common StatusBadge component for the warehouse module.
 * Maps a status key to one of four semantic tones (success / warning / info / neutral-error).
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
  style,
}) => {
  const { t } = useTranslation();
  const localizedStatus = (t.status as Record<string, string>)?.[status as string];
  const displayLabel =
    label || localizedStatus || PRODUCT_STATUS_LABELS[status as ProductStatus] || status;

  let statusClass: string;
  switch (status) {
    case 'in_stock':
    case 'success':
      statusClass = 'status-success';
      break;
    case 'low_stock':
    case 'warning':
      statusClass = 'status-warning';
      break;
    case 'on_hold':
    case 'info':
      statusClass = 'status-info';
      break;
    case 'out_of_stock':
    case 'error':
      statusClass = 'status-danger';
      break;
    default:
      statusClass = 'status-neutral';
  }

  return (
    <span className={`status-badge-custom ${statusClass} ${className}`.trim()} style={style}>
      {displayLabel}
    </span>
  );
};
