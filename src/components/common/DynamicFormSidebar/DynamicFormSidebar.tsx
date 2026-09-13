import React, { useEffect, useMemo } from 'react';
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Checkbox,
  Radio,
  Switch,
  Upload,
  Button,
  Row,
  Col,
  Tabs,
  Space,
  theme as antdTheme,
} from 'antd';
import {
  InboxOutlined,
  CloseOutlined,
  PlusOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Rule } from 'antd/es/form';
import type { DynamicFormSidebarProps, FormFieldConfig } from './types';
import { useResponsive } from '@/hooks/useResponsive';

export const DynamicFormSidebar: React.FC<DynamicFormSidebarProps> = ({
  config,
  open,
  onClose,
  onSubmit,
  data: propData,
  saving = false,
  width = 720,
  placement = 'right',
  className = '',
  style,
  extraFooter,
}) => {
  const [form] = Form.useForm();
  const { token } = antdTheme.useToken();
  const { isMobile, screenWidth } = useResponsive();

  // Dynamically calculate responsive drawer width (100% on mobile, max 95vw on tablet/desktop)
  const responsiveWidth = useMemo(() => {
    if (isMobile) return '100%';
    const numericWidth = typeof width === 'number' ? width : parseInt(String(width || 720), 10);
    return Math.min(numericWidth, Math.round(screenWidth * 0.95));
  }, [isMobile, width, screenWidth]);

  const isEdit = config.isEdit ?? (!!propData || !!config.data);
  const activeData = useMemo(() => propData ?? config.data ?? {}, [propData, config.data]);

  // Normalize incoming values for form (e.g. convert date strings to dayjs instances)
  const allFields = useMemo(() => {
    if (config.tabs && config.tabs.length > 0) {
      return config.tabs.flatMap((tab) => tab.fields);
    }
    return config.fields || [];
  }, [config.fields, config.tabs]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

    if (activeData && Object.keys(activeData).length > 0) {
      const formattedValues: Record<string, any> = { ...activeData };

      allFields.forEach((fld) => {
        const val = formattedValues[fld.key];
        if (fld.type === 'date' || fld.type === 'datetime') {
          if (val && typeof val === 'string') {
            formattedValues[fld.key] = dayjs(val);
          }
        } else if (fld.type === 'dateRange') {
          if (Array.isArray(val) && val.length === 2) {
            formattedValues[fld.key] = [dayjs(val[0]), dayjs(val[1])];
          }
        }
      });

      form.setFieldsValue(formattedValues);
    } else {
      // Set defaults
      const defaultValues: Record<string, any> = {};
      allFields.forEach((fld) => {
        if (fld.defaultValue !== undefined) {
          defaultValues[fld.key] = fld.defaultValue;
        }
      });
      form.setFieldsValue(defaultValues);
    }
  }, [open, activeData, allFields, form]);

  // Form submit handler
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Format date values back to ISO/string
      const processed: Record<string, any> = { ...values };

      // Auto-trim all string inputs (both ends)
      Object.keys(processed).forEach((key) => {
        if (typeof processed[key] === 'string') {
          processed[key] = processed[key].trim();
        }
      });

      allFields.forEach((fld) => {
        const val = processed[fld.key];
        if (val && dayjs.isDayjs(val)) {
          if (fld.type === 'date') {
            processed[fld.key] = val.format('YYYY-MM-DD');
          } else if (fld.type === 'datetime') {
            processed[fld.key] = val.toISOString();
          }
        } else if (fld.type === 'dateRange' && Array.isArray(val)) {
          processed[fld.key] = val.map((d) => (dayjs.isDayjs(d) ? d.format('YYYY-MM-DD') : d));
        }
      });

      await onSubmit(processed);
    } catch {
      // Validation error handled by antd form
    }
  };

  // Build Antd Validation Rules from field config
  const buildRules = (field: FormFieldConfig): Rule[] => {
    const rules: Rule[] = [];

    // Required
    if (field.required) {
      const fieldLabel = field.label || field.key;
      rules.push({ required: true, whitespace: true, message: `${fieldLabel} bắt buộc nhập` });
    }

    // Type email
    if (field.type === 'email') {
      rules.push({ type: 'email', message: 'Địa chỉ email không hợp lệ' });
    }

    // Min / Max length
    if (field.validation?.minLength) {
      rules.push({ min: field.validation.minLength, message: `Tối thiểu ${field.validation.minLength} ký tự` });
    }
    if (field.validation?.maxLength) {
      rules.push({ max: field.validation.maxLength, message: `Tối đa ${field.validation.maxLength} ký tự` });
    }

    // Pattern
    if (field.validation?.pattern) {
      rules.push({
        pattern: field.validation.pattern,
        message: field.validation.message || 'Dữ liệu không đúng định dạng yêu cầu',
      });
    }

    // Custom rules
    if (field.rules && field.rules.length > 0) {
      rules.push(...field.rules);
    }

    return rules;
  };

  // Auto-trim helper for text inputs when losing focus (onBlur)
  const handleInputBlur = (fieldKey: string) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const raw = e.target.value;
    if (typeof raw === 'string' && raw !== raw.trim()) {
      form.setFieldValue(fieldKey, raw.trim());
    }
  };

  // Render individual form control
  const renderControl = (field: FormFieldConfig) => {
    if (field.render) {
      return field.render(field, form);
    }

    const placeholder = field.placeholder || `Nhập ${field.label?.toLowerCase() || ''}`;

    switch (field.type) {
      case 'password':
        return (
          <Input.Password
            placeholder={placeholder}
            size="middle"
            autoComplete="new-password"
            onBlur={handleInputBlur(field.key)}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            placeholder={placeholder}
            allowClear
            size="middle"
            autoComplete="off"
            onBlur={handleInputBlur(field.key)}
          />
        );

      case 'number':
        return (
          <InputNumber
            placeholder={placeholder}
            min={field.numberConfig?.min ?? field.validation?.min}
            max={field.numberConfig?.max ?? field.validation?.max}
            step={field.numberConfig?.step || 1}
            precision={field.numberConfig?.precision}
            style={{ width: '100%' }}
            size="middle"
          />
        );

      case 'money':
      case 'currency':
        return (
          <InputNumber
            placeholder={placeholder}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            parser={(value) => (value?.replace(/\./g, '') || '') as any}
            suffix={
              field.numberConfig?.addonAfter ? undefined : (
                <span style={{ color: '#807d72', fontSize: 13, fontWeight: 500, paddingRight: 2 }}>
                  ₫
                </span>
              )
            }
            addonAfter={field.numberConfig?.addonAfter}
            min={field.numberConfig?.min ?? 0}
            max={field.numberConfig?.max}
            style={{ width: '100%' }}
            size="middle"
          />
        );

      case 'textarea':
        return (
          <Input.TextArea
            placeholder={placeholder}
            rows={field.textareaConfig?.rows || 4}
            maxLength={field.textareaConfig?.maxLength || field.validation?.maxLength}
            showCount={field.textareaConfig?.showCount}
            autoComplete="off"
            onBlur={handleInputBlur(field.key)}
          />
        );

      case 'select': {
        const isSearch =
          field.search !== undefined
            ? field.search
            : field.selectConfig?.search !== undefined
              ? field.selectConfig.search
              : field.selectConfig?.showSearch !== false;
        return (
          <Select
            placeholder={placeholder}
            options={field.options}
            allowClear={field.selectConfig?.allowClear !== false}
            showSearch={isSearch}
            filterOption={
              isSearch
                ? (input, opt) =>
                    (opt?.label as string)?.toLowerCase().includes(input.trim().toLowerCase())
                : undefined
            }
            size="middle"
          />
        );
      }

      case 'multiselect':
        return (
          <Select
            mode={field.selectConfig?.mode || 'multiple'}
            placeholder={placeholder}
            options={field.options}
            allowClear
            showSearch
            filterOption={(input, opt) =>
              (opt?.label as string)?.toLowerCase().includes(input.trim().toLowerCase())
            }
            size="middle"
          />
        );

      case 'date':
        return (
          <DatePicker
            format={field.dateConfig?.format || 'DD/MM/YYYY'}
            disabledDate={field.dateConfig?.disabledDate}
            placeholder={placeholder}
            style={{ width: '100%' }}
            size="middle"
          />
        );

      case 'datetime':
        return (
          <DatePicker
            showTime
            format={field.dateConfig?.format || 'DD/MM/YYYY HH:mm'}
            disabledDate={field.dateConfig?.disabledDate}
            placeholder={placeholder}
            style={{ width: '100%' }}
            size="middle"
          />
        );

      case 'dateRange':
        return (
          <DatePicker.RangePicker
            format={field.dateConfig?.format || 'DD/MM/YYYY'}
            style={{ width: '100%' }}
            size="middle"
          />
        );

      case 'checkbox':
        return <Checkbox>{field.label}</Checkbox>;

      case 'radio':
        return <Radio.Group options={field.options} />;

      case 'switch':
      case 'toggle':
        return <Switch />;

      case 'file':
        return (
          <Upload.Dragger
            maxCount={field.fileConfig?.maxCount || 1}
            multiple={field.fileConfig?.multiple}
            accept={field.fileConfig?.accept}
            beforeUpload={() => false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: token.colorPrimary }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 13 }}>
              Nhấp hoặc kéo thả tệp vào khu vực này để tải lên
            </p>
          </Upload.Dragger>
        );

      case 'text':
      default:
        return (
          <Input
            placeholder={placeholder}
            allowClear
            size="middle"
            autoComplete="off"
            onBlur={handleInputBlur(field.key)}
          />
        );
    }
  };

  // Render Grid of Form Fields
  const renderFields = (fields: FormFieldConfig[]) => {
    return (
      <Row gutter={[16, 0]}>
        {fields.map((field) => {
          // Section Title / Divider
          if (field.type === 'title' || field.type === 'divider') {
            return (
              <Col key={field.key} span={24}>
                <div
                  style={{
                    paddingTop: 14,
                    paddingBottom: 8,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: token.colorTextHeading,
                    }}
                  >
                    {field.label}
                  </span>
                </div>
              </Col>
            );
          }

          const span = field.colSpan || (field.type === 'textarea' || field.type === 'file' ? 24 : 12);
          const rules = buildRules(field);

          return (
            <Col key={field.key} span={span} xs={24} sm={span}>
              <Form.Item
                name={field.key}
                label={field.type !== 'checkbox' ? field.label : undefined}
                required={Boolean(field.required)}
                valuePropName={field.type === 'checkbox' || field.type === 'switch' || field.type === 'toggle' ? 'checked' : 'value'}
                rules={rules}
                extra={field.description}
                style={{ marginBottom: 16 }}
              >
                {renderControl(field)}
              </Form.Item>
            </Col>
          );
        })}
      </Row>
    );
  };

  // Header Title
  const title = isEdit ? (config.editTitle || 'Cập nhật thông tin') : (config.title || 'Tạo mới thông tin');
  const subtitle = typeof config.subtitle === 'function' ? config.subtitle(activeData) : config.subtitle;

  const headerNode = (
    <div style={{ paddingRight: 12 }}>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: token.colorTextHeading,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 2 }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  // Footer Actions
  const footerNode = (
    <div
      className="drawer-footer-actions"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        width: '100%',
      }}
    >
      <Button
        onClick={onClose}
        disabled={saving}
        icon={config.cancelIcon ?? <CloseOutlined style={{ fontSize: 13 }} />}
        style={{ minWidth: 110, height: 40, borderRadius: 8 }}
      >
        {config.cancelText || 'Hủy bỏ'}
      </Button>

      {extraFooter}

      <Button
        type="primary"
        icon={
          config.submitIcon ??
          (isEdit ? (
            <CheckOutlined style={{ fontSize: 14 }} />
          ) : (
            <PlusOutlined style={{ fontSize: 14 }} />
          ))
        }
        loading={saving}
        onClick={handleFormSubmit}
        className="btn-cursor-primary"
        style={{ minWidth: 130, height: 40 }}
      >
        {isEdit ? (config.editSubmitText || 'Lưu thay đổi') : (config.submitText || 'Thêm mới')}
      </Button>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={responsiveWidth}
      placement={placement}
      title={headerNode}
      footer={footerNode}
      destroyOnClose
      closeIcon={<CloseOutlined style={{ fontSize: 14 }} />}
      className={`dynamic-form-sidebar ${className}`.trim()}
      rootStyle={style}
      styles={{
        header: {
          padding: '14px 20px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
        body: {
          padding: config.tabs && config.tabs.length > 0 ? '0 20px 20px' : '16px 20px 24px',
        },
        footer: {
          padding: '12px 20px',
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={(label, { required }) => (
          <span>
            {label}
            {required && (
              <span
                style={{
                  color: '#ff4d4f',
                  marginLeft: 4,
                  fontSize: 14,
                  fontFamily: 'SimSun, sans-serif',
                  lineHeight: 1,
                }}
              >
                *
              </span>
            )}
          </span>
        )}
        scrollToFirstError
        autoComplete="off"
      >
        {config.tabs && config.tabs.length > 0 ? (
          <Tabs
            defaultActiveKey={config.tabs[0]?.key}
            items={config.tabs.map((tab) => ({
              key: tab.key,
              label: (
                <Space size={6}>
                  {tab.icon}
                  <span>{tab.label}</span>
                </Space>
              ),
              children: <div style={{ paddingTop: 12 }}>{renderFields(tab.fields)}</div>,
            }))}
          />
        ) : (
          renderFields(config.fields || [])
        )}
      </Form>
    </Drawer>
  );
};
