import React from 'react';
import type { TableProps } from 'antd';
import type { ColumnType } from 'antd/es/table';

export interface CommonTableActionItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  confirm?: {
    title: string;
    description?: string;
    okText?: string;
    cancelText?: string;
    centered?: boolean;
    onConfirm: () => void;
  };
}

export interface UserCellData {
  avatar?: string;
  name: string;
  code?: string;
  subtext?: string;
  onClick?: () => void;
}

export interface TitleSubtitleCellData {
  title: string;
  subtitle?: string;
}

/**
 * Column data types inspired by table.model.ts
 */
export type TableColumnDataType =
  | 'text'
  | 'number'
  | 'numberFormatted'
  | 'money'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'status'
  | 'image'
  | 'user'
  | 'titleSubtitle'
  | 'dynamic'
  | 'custom';

export interface ColumnDataMapping {
  label?: string;
  color?: string;
  colorClass?: string;
}

export interface CommonTableColumn<T> extends Omit<ColumnType<T>, 'render'> {
  /** High-level semantic column type inspired by table.model.ts */
  type?: TableColumnDataType;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  renderUser?: (record: T) => UserCellData;
  renderTitleSubtitle?: (record: T) => TitleSubtitleCellData;
  renderStatus?: boolean | { statusMap?: Record<string, string> };
  renderCurrency?: boolean;
  renderDate?: boolean;
  /** Action callback when user clicks on this cell */
  action?: (record: T) => void;
  onClick?: (record: T) => void;
  /** Render text with font-weight: 600 */
  bold?: boolean;
  /** Render text with font-family: var(--font-mono) (JetBrains Mono) */
  mono?: boolean;
  /** Automatically enable smart sorting (number, date, or string comparator) */
  allowSort?: boolean;
  sortable?: boolean;
  /** Max character length before truncating with tooltip */
  maxLength?: number;
  /** Max width before truncating with tooltip */
  maxTextWidth?: number | string;
  /** Show tooltip when text is truncated (defaults to true) */
  showTooltip?: boolean;
  /** Data / status mapping dictionary */
  dataMapping?: Record<string, ColumnDataMapping>;
  statusMapping?: Record<string, ColumnDataMapping>;
  /** Conditionally hide column */
  hide?: boolean | (() => boolean);
}

export interface CommonTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: CommonTableColumn<T>[];
  actions?: (record: T) => CommonTableActionItem[];
  actionColumnTitle?: string;
  actionColumnWidth?: number | string;
  showIndexColumn?: boolean;
  indexColumnTitle?: string;
  indexColumnWidth?: number | string;
  fixedIndexColumn?: boolean;
  fixedActionColumn?: boolean;
  // Row selection support from table.model.ts
  enableSelection?: boolean;
  selectionMode?: 'single' | 'multiple';
  selectedRowKeys?: React.Key[];
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  cardBordered?: boolean;
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
}
