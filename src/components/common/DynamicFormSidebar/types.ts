import React from 'react';
import type { Rule } from 'antd/es/form';
import type { FormInstance } from 'antd';
import type dayjs from 'dayjs';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'money'
  | 'currency'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'datetime'
  | 'dateRange'
  | 'checkbox'
  | 'radio'
  | 'segmented'
  | 'switch'
  | 'toggle'
  | 'rate'
  | 'treeSelect'
  | 'file'
  | 'title'
  | 'divider'
  | 'custom';

export interface FormFieldOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface FormFieldConfig<T = any> {
  key?: string;
  name?: string; // Alias for key
  label?: string;
  type?: FormFieldType;
  required?: boolean | string;
  placeholder?: string;
  colSpan?: number; // Out of 24 (default 12 or 24)
  span?: number; // Alias for colSpan
  defaultValue?: any;
  disabled?: boolean | ((values: T) => boolean);
  hidden?: boolean | ((values: T) => boolean);
  description?: string;
  options?: FormFieldOption[];
  rules?: Rule[];
  search?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message?: string;
  };
  numberConfig?: {
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    addonAfter?: React.ReactNode;
    suffix?: React.ReactNode;
  };
  textareaConfig?: {
    rows?: number;
    maxLength?: number;
    showCount?: boolean;
  };
  selectConfig?: {
    search?: boolean;
    showSearch?: boolean;
    allowClear?: boolean;
    mode?: 'multiple' | 'tags';
  };
  treeData?: any[];
  segmentedOptions?: (string | number | { label: string; value: any; icon?: React.ReactNode })[];
  rateConfig?: {
    count?: number;
    allowHalf?: boolean;
    allowClear?: boolean;
  };
  dateConfig?: {
    format?: string;
    showTime?: boolean;
    disabledDate?: (current: dayjs.Dayjs) => boolean;
  };
  fileConfig?: {
    accept?: string;
    maxCount?: number;
    multiple?: boolean;
  };
  render?: (field: FormFieldConfig<T>, form: FormInstance) => React.ReactNode;
  dependencies?: string[];
}

export interface FormTabConfig<T = any> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  fields: FormFieldConfig<T>[];
}

export interface DynamicFormConfig<T = any> {
  title?: string;
  editTitle?: string;
  subtitle?: string | ((data: T) => React.ReactNode);
  isEdit?: boolean;
  fields?: FormFieldConfig<T>[];
  tabs?: FormTabConfig<T>[];
  data?: T | null;
  initialValues?: T | null; // Alias for data
  submitText?: string;
  editSubmitText?: string;
  cancelText?: string;
  submitIcon?: React.ReactNode;
  cancelIcon?: React.ReactNode;
}

export interface DynamicFormSidebarProps<T = any> {
  config: DynamicFormConfig<T>;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void> | void;
  data?: T | null;
  initialValues?: T | null; // Alias for data
  saving?: boolean;
  width?: number | string;
  placement?: 'right' | 'left';
  className?: string;
  style?: React.CSSProperties;
  extraFooter?: React.ReactNode;
}
