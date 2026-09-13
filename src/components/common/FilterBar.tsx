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
  style?: React.CSSProperties;
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

  // Compute default values once (automatically defaults select with 'all' option to 'all')
  const getInitialValues = useCallback(() => {
    const init: Record<string, FilterValue> = {};
    items.forEach((item) => {
      if (item.defaultValue !== undefined) {
        init[item.name] = item.defaultValue;
      } else if (item.type === 'select') {
        const hasAll = item.options?.some((opt) => opt.value === 'all');
        init[item.name] = hasAll ? 'all' : undefined;
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
    if (onSearch) {
      onSearch(filterState);
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

    const containerStyle: React.CSSProperties = {
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
            onPressEnter={handleSearch}
            style={{ width: '100%' }}
          />
        );
        break;

      case 'select': {
        const hasAll = item.options?.some((opt) => opt.value === 'all');
        const selectVal = val !== undefined ? val : (hasAll ? 'all' : undefined);
        controlNode = (
          <Select
            placeholder={(item.placeholder as string) || 'Chọn...'}
            value={selectVal as string | number | undefined}
            options={item.options}
            allowClear={item.allowClear ?? true}
            disabled={item.disabled}
            showSearch
            optionFilterProp="label"
            onChange={(selectedVal) =>
              handleFieldChange(item.name, selectedVal ?? (hasAll ? 'all' : undefined))
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
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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
