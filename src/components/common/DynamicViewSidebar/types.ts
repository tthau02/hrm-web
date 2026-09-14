import React from 'react';

export type ViewFieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'numberFormatted'
  | 'money'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'textarea'
  | 'link'
  | 'badge'
  | 'status'
  | 'checkbox'
  | 'boolean'
  | 'toggle'
  | 'avatar'
  | 'image'
  | 'file'
  | 'title'
  | 'divider'
  | 'array'
  | 'custom';

export interface ViewFieldOption {
  label: string;
  value: any;
  color?: string;
  colorClass?: string;
}

export interface ViewFieldConfig<T = any> {
  key?: string;
  name?: string; // Alias for key
  label?: string;
  type?: ViewFieldType;
  colSpan?: number; // Out of 24 (default 24 or 12)
  span?: number; // Alias for colSpan
  hidden?: boolean | ((data: T) => boolean);
  description?: string;
  placeholder?: string;
  options?: ViewFieldOption[];
  // Status/Badge mapping
  badgeMap?: Record<string, { label: string; color?: string; status?: 'success' | 'processing' | 'default' | 'error' | 'warning' }>;
  // Title/Divider config
  titleConfig?: {
    text?: string;
    icon?: React.ReactNode;
    fontSize?: number | string;
    divider?: boolean;
  };
  // Array nested config
  arrayConfig?: {
    showIndex?: boolean;
    fields: ViewFieldConfig<any>[];
  };
  // File config
  fileConfig?: {
    preview?: boolean;
    downloadable?: boolean;
  };
  // Custom styling
  titleStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  // Custom render
  render?: (value: any, data: T) => React.ReactNode;
  // Events
  onLinkClick?: (value: any, data: T) => void;
  onToggleChange?: (value: boolean, data: T) => void;
}

export interface DynamicViewSection<T = any> {
  title?: string;
  columns?: number; // 1, 2, 3, 4 (default 2)
  fields: ViewFieldConfig<T>[];
}

export interface ViewTabConfig<T = any> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  sections?: DynamicViewSection<T>[];
  fields?: ViewFieldConfig<T>[];
  content?: React.ReactNode | ((data: T) => React.ReactNode);
  actions?: ViewActionConfig<T>[];
}

export interface ViewActionConfig<T = any> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  danger?: boolean;
  disabled?: boolean | ((data: T) => boolean);
  visible?: boolean | ((data: T) => boolean);
  loading?: boolean;
  onClick: (data: T) => void;
  confirm?: {
    title: string;
    description?: string;
    okText?: string;
    cancelText?: string;
    centered?: boolean;
  };
}

export interface DynamicViewConfig<T = any> {
  title?: string;
  subtitle?: string | ((data: T) => React.ReactNode);
  sections?: DynamicViewSection<T>[];
  fields?: ViewFieldConfig<T>[];
  tabs?: ViewTabConfig<T>[];
  actions?: ViewActionConfig<T>[];
  data?: T | null;
  extraHeader?: React.ReactNode | ((data: T) => React.ReactNode);
}

export interface DynamicViewSidebarProps<T = any> {
  config: DynamicViewConfig<T>;
  open: boolean;
  onClose: () => void;
  data?: T | null;
  loading?: boolean;
  width?: number | string;
  placement?: 'right' | 'left';
  // Record navigation support (Excel/CRM detail style)
  navigationIds?: any[];
  currentIndex?: number;
  totalCount?: number;
  onNavigate?: (id: any, index: number) => void;
  onNext?: (id: any, index: number) => void;
  onPrevious?: (id: any, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}
