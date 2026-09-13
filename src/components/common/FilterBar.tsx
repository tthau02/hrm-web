import React, { useState, useCallback } from 'react';
import {
  Card,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  theme as antdTheme,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useResponsive } from '@/hooks/useResponsive';

const { RangePicker } = DatePicker;

export type FilterFieldType = 'search' | 'text' | 'select' | 'date' | 'dateRange' | 'custom';

export interface FilterOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export type FilterValue = unknown;

export interface FilterField {
  name: string;
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
  customRender?: (props: {
    value: FilterValue;
    onChange: (val: FilterValue) => void;
    placeholder?: string | [string, string];
  }) => React.ReactNode;
}

export interface FilterBarProps {
  items: FilterField[];
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
  extraActions?: React.ReactNode;
  cardBordered?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Common FilterBar component built with Ant Design UI:
 * - Equal width for inputs, wrapping cleanly to next lines without breaking proportions
 * - Configured cleanly via an array of field objects
 * - Automatically defaults to 'all' for selects with an 'all' option
 * - Default actions: "Tìm kiếm" (primary) and "Làm mới" (secondary)
 * - Seamless Ant Design Dark & Light mode integration
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  items,
  values: controlledValues,
  onChange,
  onFilterChange,
  onSearch,
  onReset,
  loading = false,
  itemWidth = 260,
  searchButtonText = 'Tìm kiếm',
  resetButtonText = 'Làm mới',
  showSearchButton = true,
  showResetButton = true,
  extraActions,
  cardBordered = false,
  className = '',
  style,
}) => {
  const { token } = antdTheme.useToken();
  const { isMobile, isTablet } = useResponsive();

  // Compute default values once (automatically defaults select with 'all' option to 'all')
  const getInitialValues = useCallback(() => {
    const init: Record<string, FilterValue> = {};
    items.forEach((item) => {
      if (item.defaultValue !== undefined) {
        init[item.name] = item.defaultValue;
      } else if (item.type === 'select') {
        const includeAll = item.includeAll !== false;
        init[item.name] = includeAll ? 'all' : undefined;
      } else {
        init[item.name] = undefined;
      }
    });
    return init;
  }, [items]);

  // Support both controlled and uncontrolled states without syncing useEffect
  const [internalState, setInternalState] = useState<Record<string, FilterValue>>(() => getInitialValues());
  const filterState = controlledValues !== undefined ? controlledValues : internalState;

  const handleFieldChange = (name: string, val: FilterValue) => {
    const nextState = { ...filterState, [name]: val };
    if (controlledValues === undefined) {
      setInternalState(nextState);
    }
    if (onChange) {
      onChange(name, val, nextState);
    }
    if (onFilterChange) {
      onFilterChange(nextState);
    }
  };

  const handleSearch = () => {
    // Auto-trim all string values on search
    const trimmedState: Record<string, FilterValue> = {};
    let hasTrimmed = false;

    Object.keys(filterState).forEach((k) => {
      const v = filterState[k];
      if (typeof v === 'string' && v !== v.trim()) {
        trimmedState[k] = v.trim();
        hasTrimmed = true;
      } else {
        trimmedState[k] = v;
      }
    });

    if (hasTrimmed) {
      if (controlledValues === undefined) {
        setInternalState(trimmedState);
      }
      if (onChange) {
        Object.keys(trimmedState).forEach((k) => {
          if (trimmedState[k] !== filterState[k]) {
            onChange(k, trimmedState[k], trimmedState);
          }
        });
      }
      if (onFilterChange) {
        onFilterChange(trimmedState);
      }
    }

    if (onSearch) {
      onSearch(trimmedState);
    }
  };

  const handleReset = () => {
    const initial = getInitialValues();
    if (controlledValues === undefined) {
      setInternalState(initial);
    }
    if (onChange) {
      Object.keys(initial).forEach((key) => {
        onChange(key, initial[key], initial);
      });
    }
    if (onFilterChange) {
      onFilterChange(initial);
    }
    if (onReset) {
      onReset();
    }
  };

  // Render an individual filter control with uniform width
  const renderFilterControl = (item: FilterField) => {
    const val = filterState[item.name];
    const isRange = item.type === 'dateRange';
    const fieldWidth = item.width || (isRange ? Math.max(itemWidth + 40, 280) : itemWidth);

    const containerStyle: React.CSSProperties = isMobile
      ? {
          width: '100%',
          minWidth: '100%',
          flex: '1 1 100%',
          boxSizing: 'border-box',
          ...item.style,
        }
      : isTablet
        ? {
            width: 'calc(50% - 6px)',
            minWidth: 160,
            flex: '1 1 calc(50% - 6px)',
            boxSizing: 'border-box',
            ...item.style,
          }
        : {
            width: fieldWidth,
            minWidth: 180,
            flex: `0 0 ${typeof fieldWidth === 'number' ? `${fieldWidth}px` : fieldWidth}`,
            boxSizing: 'border-box',
            ...item.style,
          };

    let controlNode: React.ReactNode = null;

    switch (item.type) {
      case 'search':
        controlNode = (
          <Input
            placeholder={(item.placeholder as string) || 'Tìm kiếm...'}
            prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
            value={(val as string) ?? ''}
            allowClear={item.allowClear ?? true}
            disabled={item.disabled}
            onChange={(e) => handleFieldChange(item.name, e.target.value)}
            onBlur={(e) => {
              const raw = e.target.value;
              if (typeof raw === 'string' && raw !== raw.trim()) {
                handleFieldChange(item.name, raw.trim());
              }
            }}
            onPressEnter={handleSearch}
            style={{ width: '100%' }}
          />
        );
        break;

      case 'text':
        controlNode = (
          <Input
            placeholder={(item.placeholder as string) || 'Nhập nội dung...'}
            value={(val as string) ?? ''}
            allowClear={item.allowClear ?? true}
            disabled={item.disabled}
            onChange={(e) => handleFieldChange(item.name, e.target.value)}
            onBlur={(e) => {
              const raw = e.target.value;
              if (typeof raw === 'string' && raw !== raw.trim()) {
                handleFieldChange(item.name, raw.trim());
              }
            }}
            onPressEnter={handleSearch}
            style={{ width: '100%' }}
          />
        );
        break;

      case 'select': {
        const includeAll = item.includeAll !== false;
        const hasAllInOptions = item.options?.some((opt) => opt.value === 'all');
        const defaultAllLabel =
          item.allLabel ||
          (typeof item.placeholder === 'string' && item.placeholder.trim()
            ? item.placeholder.startsWith('Tất cả')
              ? item.placeholder
              : `Tất cả ${item.placeholder.replace(/^Chọn\s*/i, '').toLowerCase()}`
            : 'Tất cả');

        const resolvedOptions =
          includeAll && !hasAllInOptions
            ? [{ label: defaultAllLabel, value: 'all' }, ...(item.options || [])]
            : item.options || [];

        const selectVal = val !== undefined ? val : (includeAll ? 'all' : undefined);
        const isSearchable = Boolean(item.search ?? item.showSearch);
        controlNode = (
          <Select
            placeholder={(item.placeholder as string) || 'Chọn...'}
            value={selectVal as string | number | undefined}
            options={resolvedOptions}
            allowClear={item.allowClear ?? true}
            disabled={item.disabled}
            showSearch={isSearchable}
            filterOption={
              isSearchable
                ? (input, option) =>
                    String(option?.label ?? '')
                      .toLowerCase()
                      .includes(input.trim().toLowerCase())
                : undefined
            }
            optionFilterProp="label"
            onChange={(selectedVal) =>
              handleFieldChange(item.name, selectedVal ?? (includeAll ? 'all' : undefined))
            }
            style={{ width: '100%', height: 40 }}
          />
        );
        break;
      }

      case 'date':
        controlNode = (
          <DatePicker
            placeholder={(item.placeholder as string) || 'Chọn ngày'}
            value={val as Dayjs}
            allowClear={item.allowClear ?? true}
            disabled={item.disabled}
            format="DD/MM/YYYY"
            onChange={(dateVal) => handleFieldChange(item.name, dateVal)}
            style={{ width: '100%', height: 40 }}
          />
        );
        break;

      case 'dateRange': {
        const placeholders: [string, string] =
          Array.isArray(item.placeholder) && item.placeholder.length >= 2
            ? [item.placeholder[0], item.placeholder[1]]
            : ['Từ ngày', 'Đến ngày'];
        controlNode = (
          <RangePicker
            placeholder={placeholders}
            value={val as [Dayjs, Dayjs]}
            allowClear={item.allowClear ?? true}
            disabled={item.disabled}
            format="DD/MM/YYYY"
            onChange={(dates) => handleFieldChange(item.name, dates)}
            style={{ width: '100%', height: 40 }}
          />
        );
        break;
      }

      case 'custom':
        if (item.customRender) {
          controlNode = item.customRender({
            value: val,
            onChange: (newVal) => handleFieldChange(item.name, newVal),
            placeholder: item.placeholder,
          });
        }
        break;

      default:
        controlNode = null;
    }

    return (
      <div key={item.name} className="filter-field-item" style={containerStyle}>
        {item.label && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: token.colorTextSecondary,
              marginBottom: 4,
            }}
          >
            {item.label}
          </div>
        )}
        {controlNode}
      </div>
    );
  };

  return (
    <Card
      bordered={cardBordered}
      className={`common-filter-bar ${className}`.trim()}
      style={{
        borderRadius: 12,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        boxShadow: 'none',
        marginBottom: 16,
        ...style,
      }}
      styles={{ body: { padding: 14 } }}
    >
      <div
        className="common-filter-bar-content"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        {/* Filter Inputs: Equal width and clean line-wrapping */}
        <div
          className="common-filter-bar-inputs"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 12,
            flex: '1 1 auto',
          }}
        >
          {items.map((item) => renderFilterControl(item))}
        </div>

        {/* Action Buttons: Tìm kiếm & Làm mới (Default) */}
        <div className="common-filter-bar-actions" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Space size="middle" wrap>
            {showSearchButton && (
              <Button
                type="primary"
                icon={<SearchOutlined />}
                loading={loading}
                onClick={handleSearch}
                className="btn-cursor-primary"
              >
                {searchButtonText}
              </Button>
            )}

            {showResetButton && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                className="btn-hairline-secondary"
                style={{
                  background: token.colorBgContainer,
                  borderColor: token.colorBorderSecondary,
                  color: token.colorTextHeading,
                }}
              >
                {resetButtonText}
              </Button>
            )}

            {extraActions}
          </Space>
        </div>
      </div>
    </Card>
  );
};
