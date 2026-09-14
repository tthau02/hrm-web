import React, { useState, useMemo } from 'react';
import {
  Card,
  Timeline,
  Image,
  Avatar,
  Tag,
  Input,
  Empty,
  Spin,
  Space,
  theme as antdTheme,
} from 'antd';
import {
  ArrowRightOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SearchOutlined,
  HistoryOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatCurrency, formatDate } from '@/utils/format';
import { StatusBadge } from '../StatusBadge';
import { useResponsive } from '@/hooks/useResponsive';
import type {
  ChangeHistoryProps,
  ChangeHistoryItem,
  ChangeHistoryDetail,
  ChangeHistoryValueType,
} from './types';

// Helper auto detection of value type
const detectValueType = (detail: ChangeHistoryDetail): ChangeHistoryValueType => {
  if (detail.type) return detail.type;

  const val = detail.newValue !== undefined && detail.newValue !== null ? detail.newValue : detail.oldValue;
  if (val === undefined || val === null) return 'text';

  const strVal = String(val).trim();
  const propLower = detail.propertyName.toLowerCase();

  // Status check
  if (propLower.includes('trạng thái') || propLower.includes('status')) {
    return 'status';
  }

  // Money check
  if (
    (propLower.includes('lương') || propLower.includes('salary') || propLower.includes('tiền') || propLower.includes('phí')) &&
    !isNaN(Number(strVal))
  ) {
    return 'money';
  }

  // Image check
  if (
    typeof val === 'string' &&
    (/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(strVal) ||
      strVal.startsWith('data:image/') ||
      strVal.includes('/avatars/') ||
      strVal.includes('/images/'))
  ) {
    return 'image';
  }

  // Date check
  if (
    typeof val === 'string' &&
    (strVal.includes('T') || strVal.includes('/') || strVal.includes('-')) &&
    strVal.length >= 8 &&
    dayjs(strVal).isValid() &&
    !/^\d+$/.test(strVal)
  ) {
    return 'datetime';
  }

  return 'text';
};

export const ChangeHistory: React.FC<ChangeHistoryProps> = ({
  data: propData,
  listHistoryChanges: propListHistoryChanges,
  loading = false,
  title,
  mode = 'card',
  maxHeight,
  searchable = true,
  searchPlaceholder = 'Tìm kiếm lịch sử theo trường, người sửa...',
  emptyText = 'Chưa có lịch sử thay đổi nào',
  bordered = true,
  className = '',
  style,
}) => {
  const { token } = antdTheme.useToken();
  const { isMobile } = useResponsive();
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Support both data and listHistoryChanges props
  const rawList: ChangeHistoryItem[] = useMemo(
    () => propData ?? propListHistoryChanges ?? [],
    [propData, propListHistoryChanges]
  );

  // Filter history entries based on search term
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const term = searchTerm.trim().toLowerCase();

    return rawList
      .map((item) => {
        const matchesUser = item.userName?.toLowerCase().includes(term);
        const matchesSource = item.sourceName?.toLowerCase().includes(term);
        const matchesTitle = item.actionTitle?.toLowerCase().includes(term);

        const matchedDetails = item.changeDetails.filter((detail) => {
          const matchesProp = detail.propertyName.toLowerCase().includes(term);
          const matchesOld = String(detail.oldValue ?? '').toLowerCase().includes(term);
          const matchesNew = String(detail.newValue ?? '').toLowerCase().includes(term);
          return matchesProp || matchesOld || matchesNew;
        });

        if (matchesUser || matchesSource || matchesTitle || matchedDetails.length > 0) {
          return {
            ...item,
            changeDetails: matchedDetails.length > 0 ? matchedDetails : item.changeDetails,
          };
        }
        return null;
      })
      .filter((item): item is ChangeHistoryItem => item !== null);
  }, [rawList, searchTerm]);

  // Helper render for single value cell (old or new)
  const renderValueCell = (
    val: any,
    detail: ChangeHistoryDetail,
    isNew: boolean
  ): React.ReactNode => {
    if (detail.customRender) {
      return detail.customRender(val, isNew, detail);
    }

    if (val === null || val === undefined || val === '') {
      return (
        <span
          style={{
            color: token.colorTextQuaternary,
            fontStyle: 'italic',
            fontSize: 12,
          }}
        >
          {isNew ? '(Đã xóa)' : '(Trống)'}
        </span>
      );
    }

    const type = detectValueType(detail);

    // Image type
    if (type === 'image') {
      return (
        <Image
          src={String(val)}
          width={52}
          height={52}
          style={{
            objectFit: 'cover',
            borderRadius: 6,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
          fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='52' height='52' fill='%23ccc' viewBox='0 0 24 24'><path d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/></svg>"
        />
      );
    }

    // Money type
    if (type === 'money') {
      const num = Number(val);
      const text = !isNaN(num) ? formatCurrency(num) : String(val);
      return (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            fontSize: 12.5,
          }}
        >
          {text}
        </span>
      );
    }

    // Date / DateTime type
    if (type === 'date' || type === 'datetime') {
      const fmt = detail.format || (type === 'date' ? 'DD/MM/YYYY' : 'DD/MM/YYYY HH:mm:ss');
      return (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12.5,
          }}
        >
          {formatDate(val, fmt)}
        </span>
      );
    }

    // Status badge type
    if (type === 'status') {
      return <StatusBadge status={String(val)} />;
    }

    // Badge / Tag type
    if (type === 'badge') {
      return <Tag color={isNew ? 'success' : 'default'}>{String(val)}</Tag>;
    }

    // Default text
    return <span style={{ wordBreak: 'break-word', fontSize: 12.5 }}>{String(val)}</span>;
  };

  // Render individual change table
  const renderChangeDetailsTable = (details: ChangeHistoryDetail[]) => {
    return (
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
          }}
        >
          <tbody>
            {details.map((detail, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: idx < details.length - 1 ? `1px solid ${token.colorBorderSecondary}` : 'none',
                }}
              >
                {/* 1. Property Name */}
                <td
                  style={{
                    padding: '8px 12px 8px 0',
                    fontWeight: 500,
                    color: token.colorTextHeading,
                    width: isMobile ? 'auto' : 180,
                    whiteSpace: 'nowrap',
                    verticalAlign: 'middle',
                  }}
                >
                  {detail.propertyName}:
                </td>

                {/* 2. Old Value (Red tint) */}
                <td
                  style={{
                    padding: '6px 8px',
                    verticalAlign: 'middle',
                    width: isMobile ? 'auto' : '38%',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: token.colorErrorBg,
                      color: token.colorErrorText,
                      border: `1px solid ${token.colorErrorBorder}`,
                      maxWidth: '100%',
                    }}
                    className={detail.oldValueStyleClass}
                  >
                    {renderValueCell(detail.oldValue, detail, false)}
                  </div>
                </td>

                {/* 3. Transition Arrow */}
                <td
                  style={{
                    padding: '6px 8px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    width: 32,
                  }}
                >
                  <ArrowRightOutlined
                    style={{
                      color: token.colorTextTertiary,
                      fontSize: 12,
                    }}
                  />
                </td>

                {/* 4. New Value (Green tint) */}
                <td
                  style={{
                    padding: '6px 8px',
                    verticalAlign: 'middle',
                    width: isMobile ? 'auto' : '38%',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: token.colorSuccessBg,
                      color: token.colorSuccessText,
                      border: `1px solid ${token.colorSuccessBorder}`,
                      maxWidth: '100%',
                    }}
                    className={detail.newValueStyleClass}
                  >
                    {renderValueCell(detail.newValue, detail, true)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Card mode render item
  const renderCardItem = (item: ChangeHistoryItem, index: number) => {
    const isEven = index % 2 === 0;
    const accentColor = isEven ? token.colorPrimary : '#10b981'; // Cursor Orange or Emerald

    return (
      <div
        key={item.id ?? index}
        className="change-history-row"
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 16,
          padding: '14px 16px',
          borderRadius: 8,
          border: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
          marginBottom: 12,
          transition: 'all 0.15s ease',
        }}
      >
        {/* Left column: Meta Info (Time, User, Source) */}
        <div
          className="history-info-block"
          style={{
            flex: isMobile ? 'none' : '0 0 220px',
            fontSize: 12.5,
            lineHeight: 1.6,
            borderRight: isMobile ? 'none' : `1px solid ${token.colorBorderSecondary}`,
            paddingRight: isMobile ? 0 : 16,
            paddingBottom: isMobile ? 8 : 0,
            borderBottom: isMobile ? `1px dashed ${token.colorBorderSecondary}` : 'none',
          }}
        >
          {/* Change Time with active dot */}
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: token.colorTextHeading,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 6,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: accentColor,
                flexShrink: 0,
              }}
            />
            {dayjs(item.changeTime).format('HH:mm:ss DD/MM/YYYY')}
          </div>

          {/* User info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: token.colorTextSecondary,
              marginBottom: 4,
            }}
          >
            {item.userAvatar ? (
              <Avatar src={item.userAvatar} size={18} />
            ) : (
              <UserOutlined style={{ fontSize: 12, color: token.colorTextTertiary }} />
            )}
            <span>
              Người sửa: <strong style={{ color: token.colorTextHeading }}>{item.userName || 'Hệ thống'}</strong>
            </span>
          </div>

          {/* Source info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: token.colorTextSecondary,
            }}
          >
            {item.sourceIcon || <DesktopOutlined style={{ fontSize: 12, color: token.colorTextTertiary }} />}
            <span>
              Nguồn: <strong style={{ color: token.colorTextHeading }}>{item.sourceName || 'Web Portal'}</strong>
            </span>
          </div>
        </div>

        {/* Right column: Changes Details Table with left accent bar */}
        <div
          className="history-detail-card"
          style={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            paddingLeft: 12,
            borderLeft: `3px solid ${accentColor}`,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 13.5,
              color: token.colorTextHeading,
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{item.actionTitle || 'Thông tin thay đổi:'}</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: token.colorTextTertiary }}>
              {item.changeDetails.length} trường thay đổi
            </span>
          </div>

          <div
            style={{
              maxHeight: 220,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
            }}
          >
            {renderChangeDetailsTable(item.changeDetails)}
          </div>
        </div>
      </div>
    );
  };

  // Timeline mode render
  const renderTimelineMode = () => {
    const timelineItems = filteredList.map((item, index) => ({
      color: index === 0 ? token.colorPrimary : '#94a3b8',
      dot: <ClockCircleOutlined style={{ fontSize: 13 }} />,
      children: (
        <div
          key={item.id ?? index}
          style={{
            paddingBottom: 16,
          }}
        >
          {/* Header line */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <Space size="middle">
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  fontSize: 13,
                  color: token.colorTextHeading,
                }}
              >
                {dayjs(item.changeTime).format('HH:mm:ss DD/MM/YYYY')}
              </span>
              <span style={{ fontSize: 12.5, color: token.colorTextSecondary }}>
                bởi <strong style={{ color: token.colorTextHeading }}>{item.userName || 'Hệ thống'}</strong>
              </span>
              {item.sourceName && (
                <Tag style={{ margin: 0 }}>{item.sourceName}</Tag>
              )}
            </Space>
          </div>

          {/* Card detail */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            {renderChangeDetailsTable(item.changeDetails)}
          </div>
        </div>
      ),
    }));

    return <Timeline items={timelineItems} style={{ marginTop: 12 }} />;
  };

  return (
    <Card
      bordered={bordered}
      className={`common-change-history ${className}`.trim()}
      style={{
        borderRadius: 12,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        boxShadow: 'none',
        ...style,
      }}
      styles={{ body: { padding: 16 } }}
    >
      {/* Header bar: Title & Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HistoryOutlined style={{ fontSize: 16, color: token.colorPrimary }} />
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: token.colorTextHeading,
            }}
          >
            {title || 'Lịch sử thay đổi thông tin'}
          </span>
          {rawList.length > 0 && (
            <Tag style={{ margin: 0, borderRadius: 10, fontSize: 11 }}>
              {rawList.length} bản ghi
            </Tag>
          )}
        </div>

        {searchable && rawList.length > 0 && (
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{
              width: isMobile ? '100%' : 260,
              height: 36,
            }}
          />
        )}
      </div>

      {/* Body content */}
      <Spin spinning={loading}>
        <div
          style={{
            maxHeight: maxHeight || 'none',
            overflowY: maxHeight ? 'auto' : 'visible',
            paddingRight: maxHeight ? 4 : 0,
          }}
        >
          {filteredList.length === 0 ? (
            <div style={{ padding: '32px 0' }}>
              <Empty
                description={
                  <span style={{ color: token.colorTextSecondary }}>
                    {searchTerm ? 'Không tìm thấy lịch sử phù hợp với từ khóa' : emptyText}
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : mode === 'timeline' ? (
            renderTimelineMode()
          ) : (
            filteredList.map((item, idx) => renderCardItem(item, idx))
          )}
        </div>
      </Spin>
    </Card>
  );
};

export default ChangeHistory;
