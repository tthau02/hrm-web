import React from 'react';

export type FilterFieldType =
  | 'search'
  | 'text'
  | 'select'
  | 'multiSelect'
  | 'number'
  | 'numberRange'
  | 'date'
  | 'dateRange'
  | 'time'
  | 'switch'
  | 'checkbox'
  | 'custom';

export interface FilterOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export type FilterValue = unknown;

export interface FilterField {
  /** Field key / property name */
  name?: string;
  /** Alias for name, matching table-filter col.key */
  key?: string;
  type: FilterFieldType;
  label?: string;
  placeholder?: string | [string, string];
  options?: FilterOption[];
  defaultValue?: FilterValue;
  width?: number | string;
  allowClear?: boolean;
  disabled?: boolean;
  search?: boolean;
  showSearch?: boolean;
  style?: React.CSSProperties;
  includeAll?: boolean;
  allLabel?: string;
  /** Mark field as required (shows red asterisk & validates before search) */
  required?: boolean;
  /** Mark field as an advanced filter (collapsible drawer/section) */
  isAdvanced?: boolean;
  /** Trigger search immediately on value change */
  isOnChange?: boolean;
  /** Individual value change listener */
  onValueChange?: (value: FilterValue) => void;
  /** Number input limits */
  min?: number;
  max?: number;
  step?: number;
  /** Date/time format */
  format?: string;
  customRender?: (props: {
    value: FilterValue;
    onChange: (val: FilterValue) => void;
    placeholder?: string | [string, string];
  }) => React.ReactNode;
}

export interface FilterBarProps {
  items?: FilterField[];
  fields?: FilterField[]; // Alias for items
  values?: Record<string, FilterValue>;
  onChange?: (name: string, value: FilterValue, allValues: Record<string, FilterValue>) => void;
  onFilterChange?: (allValues: Record<string, FilterValue>) => void;
  onSearch?: (values: Record<string, FilterValue>) => void;
  onReset?: () => void;
  loading?: boolean;
  itemWidth?: number;
  searchButtonText?: string;
  resetButtonText?: string;
  showSearchButton?: boolean;
  showResetButton?: boolean;
  // Advanced filters support inspired by table-filter
  enableAdvancedFilters?: boolean;
  advancedFiltersLabel?: { show?: string; hide?: string };
  defaultShowAdvanced?: boolean;
  // Auto search on field value change
  autoSearchOnChange?: boolean;
  // Export support inspired by table-filter
  showExportButton?: boolean;
  onExport?: (values: Record<string, FilterValue>) => void;
  exportLoading?: boolean;
  exportButtonText?: string;
  extraActions?: React.ReactNode;
  cardBordered?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
