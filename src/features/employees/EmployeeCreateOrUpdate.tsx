import React, { useMemo } from 'react';
import { DynamicFormSidebar } from '@/components/common';
import type { DynamicFormConfig } from '@/components/common';
import type { Employee, Department } from '@/types';
import { EMPLOYEE_STATUS_OPTIONS } from '@/types';

export interface EmployeeCreateOrUpdateProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  departments: Department[];
  onSubmit: (formData: any) => Promise<void> | void;
  saving?: boolean;
}

export const EmployeeCreateOrUpdate: React.FC<EmployeeCreateOrUpdateProps> = ({
  open,
  onClose,
  employee,
  departments,
  onSubmit,
  saving = false,
}) => {
  const formConfig: DynamicFormConfig = useMemo(
    () => ({
      title: 'Thêm mới nhân viên',
      editTitle: 'Cập nhật thông tin nhân viên',
      isEdit: Boolean(employee),
      data: employee
        ? {
          ...employee,
          departmentId: employee.departmentId || departments[0]?.id,
        }
        : {
          departmentId: departments[0]?.id,
          status: 'active',
          salary: 15000000,
          joinDate: new Date().toISOString().split('T')[0],
        },
      fields: [
        {
          key: 'title_basic',
          label: 'Thông tin cơ bản',
          type: 'title',
          colSpan: 24,
        },
        {
          key: 'fullName',
          label: 'Họ và tên',
          type: 'text',
          required: true,
          colSpan: 12,
        },
        {
          key: 'code',
          label: 'Mã nhân viên',
          type: 'text',
          colSpan: 12,
        },
        {
          key: 'email',
          label: 'Email công ty',
          type: 'email',
          required: true,
          colSpan: 12,
        },
        {
          key: 'phone',
          label: 'Số điện thoại',
          type: 'text',
          required: true,
          colSpan: 12,
        },
        {
          key: 'title_work_info',
          label: 'Vị trí & Chế độ làm việc',
          type: 'title',
          colSpan: 24,
        },
        {
          key: 'departmentId',
          label: 'Phòng ban trực thuộc',
          type: 'select',
          required: true,
          options: departments.map((d) => ({ label: d.name, value: d.id })),
          colSpan: 12,
        },
        {
          key: 'position',
          label: 'Chức danh / Vị trí',
          type: 'text',
          required: true,
          colSpan: 12,
        },
        {
          key: 'status',
          label: 'Trạng thái nhân sự',
          type: 'select',
          required: true,
          options: EMPLOYEE_STATUS_OPTIONS,
          colSpan: 12,
        },
        {
          key: 'salary',
          label: 'Mức lương cơ bản',
          type: 'money',
          required: true,
          colSpan: 12,
        },
        {
          key: 'joinDate',
          label: 'Ngày bắt đầu vào làm',
          type: 'date',
          required: true,
          colSpan: 12,
        },
        {
          key: 'address',
          label: 'Địa chỉ thường trú / liên hệ',
          type: 'textarea',
          colSpan: 24,
        },
      ],
    }),
    [employee, departments]
  );

  return (
    <DynamicFormSidebar
      config={formConfig}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
    />
  );
};

export default EmployeeCreateOrUpdate;
