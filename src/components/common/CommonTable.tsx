import React, { useMemo } from 'react';
import {
  Table,
  Card,
  Dropdown,
  Button,
  Avatar,
  Space,
  Tooltip,
  Modal,
  theme as antdTheme,
} from 'antd';
import type { TableProps } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { MoreOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import { useResponsive } from '@/hooks/useResponsive';

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
    onConfirm: () => void;
  };
}

export interface UserCellData {
  avatar?: string;
  name: string;
  code?: string;
  subtext?: string;
}

export interface TitleSubtitleCellData {
  title: string;
  subtitle?: string;
}

export interface CommonTableColumn<T> extends Omit<ColumnType<T>, 'render'> {
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  renderUser?: (record: T) => UserCellData;
  renderTitleSubtitle?: (record: T) => TitleSubtitleCellData;
  renderStatus?: boolean | { statusMap?: Record<string, string> };
  renderCurrency?: boolean;
  renderDate?: boolean;
  /** Max width before truncating with tooltip */
  maxTextWidth?: number | string;
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
  cardBordered?: boolean;
  cardClassName?: string;
  cardStyle?: React.CSSProperties;
}

/**
 * CommonTable Component:
 * - Eliminates repetitive HTML markup in page components
 * - Built-in STT (Index) column by default (fixed left like Excel)
 * - Built-in text ellipsis with Tooltip
 * - Dropdown menu actions for rows with confirmation support (fixed right like Excel)
 * - Built-in helper renderers for User Avatar, Status Badges, Currency, and Dates
 */
export function CommonTable<T extends object>({
  columns,
  actions,
  actionColumnTitle = 'Thao tác',
  actionColumnWidth = 100,
  showIndexColumn = true,
  indexColumnTitle = 'STT',
  indexColumnWidth = 65,
  fixedIndexColumn = true,
  fixedActionColumn = true,
  cardBordered = false,
  cardClassName = '',
  cardStyle,
  pagination,
  scroll,
  ...tableProps
}: CommonTableProps<T>) {
  const { token } = antdTheme.useToken();
  const { isMobile } = useResponsive();

  // Track active page and size for accurate STT calculation across pagination changes
  const [currentPg, setCurrentPg] = React.useState<number>(
    pagination && typeof pagination === 'object' && pagination.current ? pagination.current : 1
  );
  const [currentSize, setCurrentSize] = React.useState<number>(
    pagination && typeof pagination === 'object' && pagination.pageSize ? pagination.pageSize : 10
  );

  // Helper: Truncated text with Tooltip
  const renderEllipsisText = (content: React.ReactNode, maxW?: number | string) => {
    if (content === null || content === undefined) return '-';
    const textStr = typeof content === 'string' ? content : String(content);

    return (
      <Tooltip title={textStr} placement="topLeft">
        <span
          style={{
            display: 'inline-block',
            maxWidth: maxW || '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            verticalAlign: 'middle',
          }}
        >
          {content}
        </span>
      </Tooltip>
    );
  };

  // Process columns to automatically handle ellipsis, formatters, and clean cells
  const processedColumns = useMemo(() => {
    const cols: ColumnsType<T> = columns.map((col) => {
      const {
        renderUser,
        renderTitleSubtitle,
        renderStatus,
        renderCurrency,
        renderDate,
        maxTextWidth,
        render: customRender,
        ...restCol
      } = col;

      // 1. User cell (Avatar, Name, Code pill, Subtext/Email)
      if (renderUser) {
        return {
          ...restCol,
          render: (_: unknown, record: T) => {
            const data = renderUser(record);
            return (
              <Space size="middle">
                <Avatar
                  src={data.avatar}
                  icon={<UserOutlined />}
                  size={40}
                  className="employee-avatar"
                  style={{ border: `2px solid ${token.colorBorderSecondary}` }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    className="employee-name"
                    style={{
                      color: token.colorTextHeading,
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {data.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 2,
                    }}
                  >
                    {data.code && (
                      <span
                        className="code-pill"
                        style={{
                          background: token.colorFillAlter,
                          color: token.colorTextSecondary,
                          border: `1px solid ${token.colorBorderSecondary}`,
                        }}
                      >
                        {data.code}
                      </span>
                    )}
                    {data.subtext && (
                      <span
                        style={{
                          fontSize: 12,
                          color: token.colorTextTertiary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {data.subtext}
                      </span>
                    )}
                  </div>
                </div>
              </Space>
            );
          },
        };
      }

      // 2. Title & Subtitle cell (e.g. Department & Position)
      if (renderTitleSubtitle) {
        return {
          ...restCol,
          render: (_: unknown, record: T) => {
            const data = renderTitleSubtitle(record);
            return (
              <div>
                <div
                  className="employee-department"
                  style={{
                    color: token.colorTextHeading,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {data.title}
                </div>
                {data.subtitle && (
                  <div
                    className="employee-position"
                    style={{
                      color: token.colorTextTertiary,
                      fontSize: 12,
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {data.subtitle}
                  </div>
                )}
              </div>
            );
          },
        };
      }

      // 3. Status cell
      if (renderStatus) {
        return {
          ...restCol,
          render: (val: unknown) => {
            const statusKey = String(val ?? '');
            return <StatusBadge status={statusKey} />;
          },
        };
      }

      // 4. Currency cell
      if (renderCurrency) {
        return {
          ...restCol,
          render: (val: unknown) => (
            <span
              className="employee-salary"
              style={{ color: token.colorTextHeading }}
            >
              {typeof val === 'number' ? formatCurrency(val) : String(val ?? '')}
            </span>
          ),
        };
      }

      // 5. Date cell
      if (renderDate) {
        return {
          ...restCol,
          render: (val: unknown) => (
            <span className="employee-date" style={{ color: token.colorTextSecondary }}>
              {typeof val === 'string' ? formatDate(val) : String(val ?? '')}
            </span>
          ),
        };
      }

      // 6. Text cell with auto Tooltip when ellipsis is enabled
      if (col.ellipsis || maxTextWidth) {
        return {
          ...restCol,
          render: (val: unknown, record: T, idx: number) => {
            if (customRender) {
              const node = customRender(val, record, idx);
              return renderEllipsisText(node, maxTextWidth);
            }
            return renderEllipsisText(val as React.ReactNode, maxTextWidth);
          },
        };
      }

      // Default with customRender if provided
      if (customRender) {
        return {
          ...restCol,
          render: customRender,
        };
      }

      return restCol;
    });

    // Prepend STT (Index) column if showIndexColumn is true (fixed left like Excel freeze pane)
    if (showIndexColumn) {
      cols.unshift({
        title: (
          <span style={{ whiteSpace: 'nowrap' }}>{indexColumnTitle}</span>
        ),
        key: '__stt__',
        align: 'center',
        width: indexColumnWidth,
        fixed: fixedIndexColumn ? 'left' : undefined,
        render: (_: unknown, __: T, index: number) => {
          const activePage =
            pagination && typeof pagination === 'object' && pagination.current
              ? pagination.current
              : currentPg;
          const activeSize =
            pagination && typeof pagination === 'object' && pagination.pageSize
              ? pagination.pageSize
              : currentSize;
          return (
            <span
              style={{
                color: token.colorTextSecondary,
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
                fontWeight: 500,
              }}
            >
              {(activePage - 1) * activeSize + index + 1}
            </span>
          );
        },
      });
    }

    // Append Dropdown Actions column if actions prop is defined (fixed right like Excel freeze pane)
    if (actions) {
      cols.push({
        title: (
          <span style={{ whiteSpace: 'nowrap' }}>{actionColumnTitle}</span>
        ),
        key: '__actions__',
        align: 'center',
        width: actionColumnWidth,
        fixed: fixedActionColumn ? 'right' : undefined,
        render: (_: unknown, record: T) => {
          const actionItems = actions(record);
          if (!actionItems || actionItems.length === 0) return null;

          const menuItems = actionItems.map((act) => ({
            key: act.key,
            label: act.label,
            icon: act.icon,
            danger: act.danger,
            disabled: act.disabled,
            onClick: () => {
              if (act.confirm) {
                Modal.confirm({
                  title: act.confirm.title,
                  content: act.confirm.description,
                  icon: <ExclamationCircleOutlined style={{ color: '#cf2d56' }} />,
                  okText: act.confirm.okText || 'Xác nhận',
                  cancelText: act.confirm.cancelText || 'Hủy',
                  okButtonProps: { danger: act.danger },
                  onOk: () => {
                    act.confirm?.onConfirm();
                  },
                });
              } else if (act.onClick) {
                act.onClick();
              }
            },
          }));

          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="default"
                  shape="circle"
                  className="common-table-action-btn"
                  icon={<MoreOutlined style={{ fontSize: 17 }} />}
                  title="Thao tác"
                />
              </Dropdown>
            </div>
          );
        },
      });
    }

    return cols;
  }, [
    columns,
    actions,
    actionColumnTitle,
    actionColumnWidth,
    showIndexColumn,
    indexColumnTitle,
    indexColumnWidth,
    fixedIndexColumn,
    fixedActionColumn,
    pagination,
    currentPg,
    currentSize,
    token,
  ]);

  // Calculate total columns width to ensure horizontal scrollbar is active and fixed columns stick properly
  const totalColumnsWidth = useMemo(() => {
    return processedColumns.reduce((sum, col) => {
      const w =
        typeof col.width === 'number'
          ? col.width
          : parseInt(String(col.width || 120), 10);
      return sum + (isNaN(w) ? 120 : w);
    }, 0);
  }, [processedColumns]);

  const mergedScroll = useMemo(() => {
    return {
      x: scroll?.x ?? Math.max(totalColumnsWidth, 1250),
      ...scroll,
    };
  }, [scroll, totalColumnsWidth]);

  return (
    <Card
      bordered={cardBordered}
      className={`common-table-card ${cardClassName}`.trim()}
      style={{
        borderRadius: 12,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        boxShadow: 'none',
        ...cardStyle,
      }}
      styles={{ body: { padding: 0 } }}
    >
      <Table<T>
        columns={processedColumns}
        scroll={mergedScroll}
        onChange={(pag, filters, sorter, extra) => {
          if (pag.current) setCurrentPg(pag.current);
          if (pag.pageSize) setCurrentSize(pag.pageSize);
          tableProps.onChange?.(pag, filters, sorter, extra);
        }}
        pagination={
          pagination === false
            ? false
            : {
                pageSize: 10,
                size: isMobile ? 'small' : undefined,
                showSizeChanger: !isMobile,
                showTotal: (total) => (isMobile ? `Tổng: ${total}` : `Tổng số ${total} bản ghi`),
                style: { padding: isMobile ? '8px 12px 10px' : '0 16px 12px' },
                ...pagination,
              }
        }
        {...tableProps}
      />
    </Card>
  );
}
