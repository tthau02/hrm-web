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
  Image,
  Tag,
  theme as antdTheme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import { MoreOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { StatusBadge } from '../StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import { useResponsive } from '@/hooks/useResponsive';
import type { CommonTableProps } from './types';

// Safe nested value resolver
const getNestedValue = (obj: any, path?: any): any => {
  if (!obj || path === undefined || path === null) return undefined;
  if (Array.isArray(path)) {
    return path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }
  if (typeof path === 'string' && path.includes('.')) {
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }
  return obj[path];
};

/**
 * CommonTable Component:
 * - Declarative column configuration inspired by table.model.ts (types: money, date, status, image...)
 * - Built-in smart sorting, cell action clicks, bold/mono styling, and auto text truncation with Tooltip
 * - Built-in STT (Index) column by default (fixed left like Excel)
 * - Row selection support (single / multiple with checkboxes or radios)
 * - Dropdown menu actions for rows with confirmation support (fixed right like Excel)
 * - Seamless Ant Design Dark & Light mode integration
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
  enableSelection = false,
  selectionMode = 'multiple',
  selectedRowKeys,
  onSelectionChange,
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
  const controlledCurrent = pagination && typeof pagination === 'object' ? pagination.current : undefined;
  const controlledPageSize = pagination && typeof pagination === 'object' ? pagination.pageSize : undefined;

  const [currentPg, setCurrentPg] = React.useState<number>(controlledCurrent || 1);
  const [currentSize, setCurrentSize] = React.useState<number>(controlledPageSize || 10);

  React.useEffect(() => {
    if (controlledCurrent !== undefined) {
      setCurrentPg(controlledCurrent);
    }
  }, [controlledCurrent]);

  React.useEffect(() => {
    if (controlledPageSize !== undefined) {
      setCurrentSize(controlledPageSize);
    }
  }, [controlledPageSize]);

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

  // Process columns to automatically handle semantic types, ellipsis, formatters, and clean cells
  const processedColumns = useMemo(() => {
    // 1. Filter out columns configured with hide
    const visibleColumns = columns.filter((col) => {
      if (typeof col.hide === 'function') return !col.hide();
      return !col.hide;
    });

    const cols: ColumnsType<T> = visibleColumns.map((col) => {
      const {
        type: colType,
        renderUser,
        renderTitleSubtitle,
        renderStatus,
        renderCurrency,
        renderDate,
        maxTextWidth,
        maxLength,
        action,
        onClick,
        bold,
        mono,
        allowSort,
        sortable,
        dataMapping,
        statusMapping,
        hide: _hide,
        render: customRender,
        ...restCol
      } = col;

      const cellAction = action || onClick;

      // Auto resolve dataIndex and key so users can provide either one without repeating
      const effectiveDataIndex =
        restCol.dataIndex ??
        (typeof restCol.key === 'string' && !['__stt__', '__actions__', 'action', 'actions'].includes(restCol.key)
          ? (restCol.key as any)
          : undefined);

      const effectiveKey =
        restCol.key ??
        (typeof restCol.dataIndex === 'string'
          ? restCol.dataIndex
          : Array.isArray(restCol.dataIndex)
          ? restCol.dataIndex.join('.')
          : undefined);

      const resolvedCol = {
        ...restCol,
        dataIndex: effectiveDataIndex,
        key: effectiveKey,
      };

      // Smart sorter generation if allowSort / sortable is requested
      let sorter = resolvedCol.sorter;
      if (!sorter && (allowSort || sortable) && effectiveDataIndex) {
        if (
          colType === 'number' ||
          colType === 'numberFormatted' ||
          colType === 'money' ||
          colType === 'currency' ||
          renderCurrency
        ) {
          sorter = (a: T, b: T) => {
            const valA = Number(getNestedValue(a, effectiveDataIndex) ?? 0);
            const valB = Number(getNestedValue(b, effectiveDataIndex) ?? 0);
            return valA - valB;
          };
        } else if (colType === 'date' || colType === 'datetime' || renderDate) {
          sorter = (a: T, b: T) => {
            const valA = dayjs(getNestedValue(a, effectiveDataIndex) ?? 0).unix();
            const valB = dayjs(getNestedValue(b, effectiveDataIndex) ?? 0).unix();
            return valA - valB;
          };
        } else {
          sorter = (a: T, b: T) => {
            const valA = String(getNestedValue(a, effectiveDataIndex) ?? '');
            const valB = String(getNestedValue(b, effectiveDataIndex) ?? '');
            return valA.localeCompare(valB);
          };
        }
      }

      // Default alignments based on semantic column type
      let align = restCol.align;
      if (!align) {
        if (
          colType === 'number' ||
          colType === 'numberFormatted' ||
          colType === 'money' ||
          colType === 'currency' ||
          renderCurrency
        ) {
          align = 'right';
        } else if (
          colType === 'date' ||
          colType === 'datetime' ||
          colType === 'status' ||
          colType === 'image' ||
          renderDate ||
          renderStatus
        ) {
          align = 'center';
        }
      }

      // Helper to wrap text with bold, mono, maxLength tooltip, and action hover
      const wrapCell = (content: React.ReactNode, isMono = mono, isBold = bold) => {
        let node = content;
        if (maxLength && typeof node === 'string' && node.length > maxLength) {
          node = (
            <Tooltip title={node} placement="topLeft">
              <span>{node.slice(0, maxLength)}...</span>
            </Tooltip>
          );
        } else if (col.ellipsis || maxTextWidth) {
          node = renderEllipsisText(node, maxTextWidth);
        }

        const style: React.CSSProperties = {
          ...(isMono ? { fontFamily: 'var(--font-mono)' } : {}),
          ...(isBold ? { fontWeight: 600 } : {}),
          ...(cellAction ? { transition: 'color 0.15s ease' } : {}),
        };

        if (isMono || isBold || cellAction) {
          return (
            <span
              style={style}
              onMouseEnter={(e) => {
                if (cellAction) e.currentTarget.style.color = token.colorPrimary;
              }}
              onMouseLeave={(e) => {
                if (cellAction) e.currentTarget.style.color = '';
              }}
            >
              {node}
            </span>
          );
        }
        return node;
      };

      // Cell click handler wrapper
      const onCell = (record: T, rowIndex?: number) => {
        const baseCell = restCol.onCell ? restCol.onCell(record, rowIndex) : {};
        if (cellAction) {
          return {
            ...baseCell,
            onClick: (e: React.MouseEvent) => {
              baseCell.onClick?.(e);
              cellAction(record);
            },
            style: {
              cursor: 'pointer',
              ...baseCell.style,
            },
          };
        }
        return baseCell;
      };

      // 1. User cell (Avatar, Name, Code pill, Subtext/Email)
      if (colType === 'user' || renderUser) {
        return {
          ...resolvedCol,
          sorter,
          align,
          onCell: (record: T, rowIndex?: number) => {
            const data = renderUser ? renderUser(record) : undefined;
            const targetAction = data?.onClick || cellAction;
            const baseCell = restCol.onCell ? restCol.onCell(record, rowIndex) : {};
            if (targetAction) {
              return {
                ...baseCell,
                onClick: (e: React.MouseEvent) => {
                  baseCell.onClick?.(e);
                  targetAction(record);
                },
                style: {
                  cursor: 'pointer',
                  ...baseCell.style,
                },
              };
            }
            return baseCell;
          },
          render: (_: unknown, record: T) => {
            const data = renderUser
              ? renderUser(record)
              : {
                  name: String(getNestedValue(record, effectiveDataIndex) ?? ''),
                  avatar: (record as any).avatar,
                  code: (record as any).code,
                  subtext: (record as any).email,
                  onClick: cellAction ? () => cellAction(record) : undefined,
                };

            return (
              <Space
                size="middle"
                style={{
                  cursor: data.onClick ? 'pointer' : undefined,
                  width: '100%',
                }}
              >
                <Avatar
                  src={data.avatar}
                  icon={<UserOutlined />}
                  size={40}
                  className="employee-avatar"
                  style={{ border: `2px solid ${token.colorBorderSecondary}`, flexShrink: 0 }}
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
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (data.onClick) {
                        e.currentTarget.style.color = token.colorPrimary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (data.onClick) {
                        e.currentTarget.style.color = token.colorTextHeading;
                      }
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
      if (colType === 'titleSubtitle' || renderTitleSubtitle) {
        return {
          ...resolvedCol,
          sorter,
          align,
          onCell,
          render: (_: unknown, record: T) => {
            const data = renderTitleSubtitle
              ? renderTitleSubtitle(record)
              : {
                  title: String(getNestedValue(record, effectiveDataIndex) ?? ''),
                  subtitle: undefined,
                };
            return (
              <div>
                <div
                  style={{
                    color: token.colorTextHeading,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    ...(cellAction ? { cursor: 'pointer', transition: 'color 0.15s ease' } : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (cellAction) e.currentTarget.style.color = token.colorPrimary;
                  }}
                  onMouseLeave={(e) => {
                    if (cellAction) e.currentTarget.style.color = token.colorTextHeading;
                  }}
                >
                  {data.title}
                </div>
                {data.subtitle && (
                  <div
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
      if (colType === 'status' || renderStatus) {
        const mapping = dataMapping || statusMapping;
        return {
          ...resolvedCol,
          sorter,
          align,
          onCell,
          render: (val: unknown, record: T, idx: number) => {
            if (customRender) {
              return customRender(val, record, idx);
            }
            const statusKey = String(val ?? '');
            if (mapping && mapping[statusKey]) {
              const item = mapping[statusKey];
              return (
                <Tag color={item.color || 'default'} style={{ margin: 0 }}>
                  {item.label || statusKey}
                </Tag>
              );
            }
            return <StatusBadge status={statusKey} />;
          },
        };
      }

      // 4. Currency / Money cell
      if (colType === 'money' || colType === 'currency' || renderCurrency) {
        return {
          ...resolvedCol,
          sorter,
          align,
          onCell,
          render: (val: unknown, record: T, idx: number) => {
            if (customRender) {
              return wrapCell(customRender(val, record, idx), true, bold !== false);
            }
            const num = Number(val ?? 0);
            const text = !isNaN(num) ? formatCurrency(num) : String(val ?? '');
            return wrapCell(text, true, bold !== false);
          },
        };
      }

      // 5. Date cell
      if (colType === 'date' || renderDate) {
        return {
          ...resolvedCol,
          sorter,
          align,
          onCell,
          render: (val: unknown, record: T, idx: number) => {
            if (customRender) {
              return wrapCell(customRender(val, record, idx), true);
            }
            const text = val ? formatDate(String(val), 'DD/MM/YYYY') : '-';
            return wrapCell(text, true);
          },
        };
      }

      // 6. DateTime cell
      if (colType === 'datetime') {
        return {
          ...resolvedCol,
          sorter,
          align,
          onCell,
          render: (val: unknown, record: T, idx: number) => {
            if (customRender) {
              return wrapCell(customRender(val, record, idx), true);
            }
            const text = val ? formatDate(String(val), 'DD/MM/YYYY HH:mm') : '-';
            return wrapCell(text, true);
          },
        };
      }

      // 7. NumberFormatted cell
      if (colType === 'numberFormatted') {
        return {
          ...resolvedCol,
          sorter,
          align,
          onCell,
          render: (val: unknown, record: T, idx: number) => {
            if (customRender) {
              return wrapCell(customRender(val, record, idx), true);
            }
            const num = Number(val);
            const text = !isNaN(num) ? num.toLocaleString('vi-VN') : String(val ?? '');
            return wrapCell(text, true);
          },
        };
      }

      // 8. Number cell
      if (colType === 'number') {
        return {
          ...resolvedCol,
          sorter,
          align,
          onCell,
          render: (val: unknown, record: T, idx: number) => {
            if (customRender) {
              return wrapCell(customRender(val, record, idx), true);
            }
            return wrapCell(String(val ?? ''), true);
          },
        };
      }

      // 9. Image cell
      if (colType === 'image') {
        return {
          ...resolvedCol,
          align,
          onCell,
          render: (val: unknown) => {
            if (!val) return <span style={{ color: token.colorTextQuaternary }}>-</span>;
            return (
              <Image
                src={String(val)}
                width={40}
                height={40}
                style={{
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              />
            );
          },
        };
      }

      // 10. Dynamic HTML / string cell
      if (colType === 'dynamic') {
        return {
          ...resolvedCol,
          sorter,
          align,
          onCell,
          render: (val: unknown, record: T, idx: number) => {
            if (customRender) {
              return wrapCell(customRender(val, record, idx));
            }
            return <span dangerouslySetInnerHTML={{ __html: String(val ?? '') }} />;
          },
        };
      }

      // Default
      return {
        ...resolvedCol,
        sorter,
        align,
        onCell,
        render: (val: unknown, record: T, idx: number) => {
          if (customRender) {
            return wrapCell(customRender(val, record, idx));
          }
          return wrapCell(String(val ?? ''));
        },
      };
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
                  centered: act.confirm.centered ?? true,
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

  // Row selection (checkbox / radio) support like common-table
  const rowSelection: TableRowSelection<T> | undefined = useMemo(() => {
    if (!enableSelection && !tableProps.rowSelection) return undefined;
    if (tableProps.rowSelection) return tableProps.rowSelection;

    return {
      type: selectionMode === 'single' ? ('radio' as const) : ('checkbox' as const),
      selectedRowKeys,
      onChange: (keys: React.Key[], rows: T[]) => {
        onSelectionChange?.(keys, rows);
      },
      columnWidth: 48,
      fixed: fixedIndexColumn ? 'left' : undefined,
    };
  }, [
    enableSelection,
    selectionMode,
    selectedRowKeys,
    onSelectionChange,
    fixedIndexColumn,
    tableProps.rowSelection,
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
        rowSelection={rowSelection}
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

export default CommonTable;
