import React from 'react';
import type { EmployeeStatus } from '@/types';
import { EMPLOYEE_STATUS_LABELS } from '@/types';

export interface StatusBadgeProps {
  status: EmployeeStatus | string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Common StatusBadge component for HRM:
 * Automatically assigns appropriate colors for active, probation, on_leave, resigned statuses
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
  style,
}) => {
  const displayLabel = label || EMPLOYEE_STATUS_LABELS[status as EmployeeStatus] || status;

  let statusClass: string;
  switch (status) {
    case 'active':
    case 'on_time':
    case 'success':
      statusClass = 'status-active';
      break;
    case 'probation':
    case 'late':
    case 'warning':
      statusClass = 'status-probation';
      break;
    case 'on_leave':
    case 'leave_approved':
    case 'info':
      statusClass = 'status-on-leave';
      break;
    case 'resigned':
    case 'absent':
    case 'error':
      statusClass = 'status-resigned';
      break;
    default:
      statusClass = 'status-resigned';
  }

  return (
    <span className={`status-badge-custom ${statusClass} ${className}`.trim()} style={style}>
      {displayLabel}
    </span>
  );
};
