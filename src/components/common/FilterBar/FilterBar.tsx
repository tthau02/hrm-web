import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Input,
  InputNumber,
  Select,
  DatePicker,
  TimePicker,
  Switch,
  Button,
  Space,
  Badge,
  theme as antdTheme,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  DownOutlined,
  UpOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useResponsive } from '@/hooks/useResponsive';
import type { FilterField, FilterBarProps, FilterValue } from './types';

const { RangePicker } = DatePicker;

export const getFieldKey = (item: FilterField): string => {
  return item.name || item.key || '';
};

/**
 * Common FilterBar component built with Ant Design UI:
 * - Declarative & extensible inspired by table-filter (types: search, text, select, multiSelect, number, numberRange, date, dateRange, time, switch)
 * - Collapsible Advanced Filters section with active count badge
 * - Validation for required filters (visual highlight)
 * - Smart enter-to-search and auto-trimming
 * - Integrated Excel Export action button
 * - Seamless Ant Design Dark & Light mode integration
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  items: propItems,
  fields: propFields,
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
  enableAdvancedFilters,
  advancedFiltersLabel,
  defaultShowAdvanced = false,
  autoSearchOnChange = false,
  showExportButton = false,
  onExport,
  exportLoading = false,
  exportButtonText = 'Xuất Excel',
  extraActions,
  cardBordered = false,
  className = '',
  style,
}) => {
  const { token } = antdTheme.useToken();
  const { isMobile, isTablet } = useResponsive();

  // Support both items and fields aliases
  const items = useMemo(() => propFields ?? propItems ?? [], [propFields, propItems]);

  // Separate basic vs advanced filter fields
  const { basicItems, advancedItems, hasAdvanced } = useMemo(() => {
    const basic: FilterField[] = [];
    const adv: FilterField[] = [];
    items.forEach((item) => {
      if (item.isAdvanced) {
        adv.push(item);
      } else {
        basic.push(item);
      }
    });
    return {
      basicItems: basic,
      advancedItems: adv,
      hasAdvanced: Boolean(enableAdvancedFilters || adv.length > 0),
    };
  }, [items, enableAdvancedFilters]);

  const [showAdvanced, setShowAdvanced] = useState<boolean>(defaultShowAdvanced);
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});

  // Compute default values once
  const getInitialValues = useCallback(() => {
    const init: Record<string, FilterValue> = {};
    items.forEach((item) => {
      const k = getFieldKey(item);
      if (!k) return;
      if (item.defaultValue !== undefined) {
        init[k] = item.defaultValue;
      } else if (item.type === 'select') {
        const includeAll = item.includeAll !== false;
        init[k] = includeAll ? 'all' : undefined;
      } else if (item.type === 'multiSelect') {
        init[k] = [];
      } else if (item.type === 'switch' || item.type === 'checkbox') {
        init[k] = false;
      } else {
        init[k] = undefined;
      }
    });
    return init;
  }, [items]);

  // Controlled and uncontrolled states
  const [internalState, setInternalState] = useState<Record<string, FilterValue>>(() => getInitialValues());
  const filterState = controlledValues !== undefined ? controlledValues : internalState;

  // Count active filters in the advanced section
  const activeAdvancedCount = useMemo(() => {
    let count = 0;
    advancedItems.forEach((item) => {
      const k = getFieldKey(item);
      const v = filterState[k];
      if (v !== undefined && v !== null && v !== '' && v !== 'all') {
        if (Array.isArray(v) && v.length === 0) return;
        count += 1;
      }
    });
    return count;
  }, [advancedItems, filterState]);

  const handleFieldChange = (name: string, val: FilterValue) => {
    // Clear validation error when user enters value
    if (invalidFields[name]) {
      setInvalidFields((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    const nextState = { ...filterState, [name]: val };
    if (controlledValues === undefined) {
      setInternalState(nextState);
    }

    // Call item specific onValueChange if defined
    const matchedItem = items.find((i) => getFieldKey(i) === name);
    if (matchedItem?.onValueChange) {
      matchedItem.onValueChange(val);
    }

    if (onChange) {
      onChange(name, val, nextState);
    }
    if (onFilterChange) {
      onFilterChange(nextState);
    }

    // Auto-search if on-change is enabled for this item or globally
    if (matchedItem?.isOnChange || autoSearchOnChange) {
      onSearch?.(nextState);
    }
  };

  const handleSearch = () => {
    // Validate required fields
    const newInvalid: Record<string, boolean> = {};
    let hasError = false;

    items.forEach((item) => {
      if (item.required) {
        const k = getFieldKey(item);
        const v = filterState[k];
        if (
          v === undefined ||
          v === null ||
          v === '' ||
          v === 'all' ||
          (Array.isArray(v) && v.length === 0)
        ) {
          newInvalid[k] = true;
          hasError = true;
        }
      }
    });

    if (hasError) {
      setInvalidFields(newInvalid);
      return;
    }
    setInvalidFields({});

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
    setInvalidFields({});
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
    const k = getFieldKey(item);
    const val = filterState[k];
    const isInvalid = Boolean(invalidFields[k]);
    const isRange = item.type === 'dateRange' || item.type === 'numberRange';
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
            onChange={(e) => handleFieldChange(k, e.target.value)}
            onBlur={(e) => {
              const raw = e.target.value;
              if (typeof raw === 'string' && raw !== raw.trim()) {
                handleFieldChange(k, raw.trim());
              }
            }}
            onPressEnter={handleSearch}
            style={{
              width: '100%',
              borderColor: isInvalid ? token.colorError : undefined,
            }}
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
            onChange={(e) => handleFieldChange(k, e.target.value)}
            onBlur={(e) => {
              const raw = e.target.value;
              if (typeof raw === 'string' && raw !== raw.trim()) {
                handleFieldChange(k, raw.trim());
              }
            }}
            onPressEnter={handleSearch}
            style={{
              width: '100%',
              borderColor: isInvalid ? token.colorError : undefined,
            }}
          />
        );
        break;

      case 'number':
        controlNode = (
          <InputNumber
            placeholder={(item.placeholder as string) || 'Nhập số...'}
            value={val as number | undefined}
            min={item.min}
            max={item.max}
            step={item.step ?? 1}
            disabled={item.disabled}
            onChange={(num) => handleFieldChange(k, num)}
            onPressEnter={handleSearch}
            style={{
              width: '100%',
              fontFamily: 'var(--font-mono)',
              borderColor: isInvalid ? token.colorError : undefined,
            }}
          />
        );
        break;

      case 'numberRange': {
        const rangeVal = Array.isArray(val) ? val : [undefined, undefined];
        const placeholders: [string, string] =
          Array.isArray(item.placeholder) && item.placeholder.length >= 2
            ? [item.placeholder[0], item.placeholder[1]]
            : ['Từ số...', 'Đến số...'];

        controlNode = (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
            <InputNumber
              placeholder={placeholders[0]}
              value={rangeVal[0] as number | undefined}
              min={item.min}
              max={rangeVal[1] !== undefined ? (rangeVal[1] as number) : item.max}
              step={item.step ?? 1}
              disabled={item.disabled}
              onChange={(num) => handleFieldChange(k, [num, rangeVal[1]])}
              onPressEnter={handleSearch}
              style={{
                flex: 1,
                fontFamily: 'var(--font-mono)',
                borderColor: isInvalid ? token.colorError : undefined,
              }}
            />
            <span style={{ color: token.colorTextQuaternary }}>-</span>
            <InputNumber
              placeholder={placeholders[1]}
              value={rangeVal[1] as number | undefined}
              min={rangeVal[0] !== undefined ? (rangeVal[0] as number) : item.min}
              max={item.max}
              step={item.step ?? 1}
              disabled={item.disabled}
              onChange={(num) => handleFieldChange(k, [rangeVal[0], num])}
              onPressEnter={handleSearch}
              style={{
                flex: 1,
                fontFamily: 'var(--font-mono)',
                borderColor: isInvalid ? token.colorError : undefined,
              }}
            />
          </div>
        );
        break;
      }

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
              handleFieldChange(k, selectedVal ?? (includeAll ? 'all' : undefined))
            }
            style={{
              width: '100%',
              height: 40,
              borderColor: isInvalid ? token.colorError : undefined,
            }}
          />
        );
        break;
      }

      case 'multiSelect': {
        const selectVal = Array.isArray(val) ? val : [];
        controlNode = (
          <Select
            mode="multiple"
            maxTagCount="responsive"
            placeholder={(item.placeholder as string) || 'Chọn nhiều...'}
            value={selectVal}
            options={item.options || []}
            allowClear={item.allowClear ?? true}
            disabled={item.disabled}
            showSearch={item.search ?? item.showSearch ?? true}
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.trim().toLowerCase())
            }
            optionFilterProp="label"
            onChange={(selectedVals) => handleFieldChange(k, selectedVals)}
            style={{
              width: '100%',
              minHeight: 40,
              borderColor: isInvalid ? token.colorError : undefined,
            }}
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
            format={item.format || 'DD/MM/YYYY'}
            onChange={(dateVal) => handleFieldChange(k, dateVal)}
            style={{
              width: '100%',
              height: 40,
              borderColor: isInvalid ? token.colorError : undefined,
            }}
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
            format={item.format || 'DD/MM/YYYY'}
            onChange={(dates) => handleFieldChange(k, dates)}
            style={{
              width: '100%',
              height: 40,
              borderColor: isInvalid ? token.colorError : undefined,
            }}
          />
        );
        break;
      }

      case 'time':
        controlNode = (
          <TimePicker
            placeholder={(item.placeholder as string) || 'Chọn giờ'}
            value={val as Dayjs}
            allowClear={item.allowClear ?? true}
            disabled={item.disabled}
            format={item.format || 'HH:mm'}
            onChange={(timeVal) => handleFieldChange(k, timeVal)}
            style={{
              width: '100%',
              height: 40,
              borderColor: isInvalid ? token.colorError : undefined,
            }}
          />
        );
        break;

      case 'switch':
      case 'checkbox':
        controlNode = (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 40,
              gap: 8,
            }}
          >
            <Switch
              checked={Boolean(val)}
              disabled={item.disabled}
              onChange={(checked) => handleFieldChange(k, checked)}
            />
            <span style={{ fontSize: 13, color: token.colorTextHeading }}>
              {typeof item.placeholder === 'string' ? item.placeholder : ''}
            </span>
          </div>
        );
        break;

      case 'custom':
        if (item.customRender) {
          controlNode = item.customRender({
            value: val,
            onChange: (newVal) => handleFieldChange(k, newVal),
            placeholder: item.placeholder,
          });
        }
        break;

      default:
        controlNode = null;
    }

    return (
      <div key={k} className="filter-field-item" style={containerStyle}>
        {item.label && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: isInvalid ? token.colorError : token.colorTextSecondary,
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{item.label}</span>
            {item.required && <span style={{ color: token.colorError, fontWeight: 'bold' }}>*</span>}
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
        {/* Basic Filter Inputs */}
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
          {basicItems.map((item) => renderFilterControl(item))}
        </div>

        {/* Action Toolbar */}
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

            {/* Toggle Advanced Filters Button */}
            {hasAdvanced && (
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="btn-hairline-secondary"
                style={{
                  background: showAdvanced ? token.colorFillAlter : token.colorBgContainer,
                  borderColor: showAdvanced ? token.colorPrimary : token.colorBorderSecondary,
                  color: showAdvanced ? token.colorPrimary : token.colorTextHeading,
                }}
              >
                <span>
                  {showAdvanced
                    ? advancedFiltersLabel?.hide || 'Thu gọn bộ lọc'
                    : advancedFiltersLabel?.show || 'Bộ lọc nâng cao'}
                </span>
                {activeAdvancedCount > 0 && (
                  <Badge
                    count={activeAdvancedCount}
                    style={{
                      backgroundColor: token.colorPrimary,
                      marginLeft: 6,
                    }}
                  />
                )}
                {showAdvanced ? (
                  <UpOutlined style={{ fontSize: 10, marginLeft: 4 }} />
                ) : (
                  <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
                )}
              </Button>
            )}

            {/* Export Excel Button */}
            {(showExportButton || onExport) && (
              <Button
                icon={<FileExcelOutlined style={{ color: '#107c41' }} />}
                loading={exportLoading}
                onClick={() => onExport?.(filterState)}
                className="btn-hairline-secondary"
                style={{
                  background: token.colorBgContainer,
                  borderColor: token.colorBorderSecondary,
                  color: token.colorTextHeading,
                }}
              >
                {exportButtonText}
              </Button>
            )}

            {extraActions}
          </Space>
        </div>
      </div>

      {/* Advanced Filters Collapsible Section */}
      {hasAdvanced && showAdvanced && (
        <div
          className="common-filter-bar-advanced"
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px dashed ${token.colorBorderSecondary}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {advancedItems.map((item) => renderFilterControl(item))}
        </div>
      )}
    </Card>
  );
};

export default FilterBar;
