import React, { useMemo } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { DynamicViewSidebar } from '@/components/common';
import type { DynamicViewConfig } from '@/components/common';
import type { Employee } from '@/types';

export interface EmployeeViewProps {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onNavigate: (index: number) => void;
}

export const EmployeeView: React.FC<EmployeeViewProps> = ({
  open,
  onClose,
  employee,
  employees,
  onEdit,
  onDelete,
  onNavigate,
}) => {
  const viewConfig: DynamicViewConfig<Employee> = useMemo(
    () => ({
      title: employee ? employee.fullName : 'Chi tiết nhân viên',
      subtitle: employee
        ? `${employee.code || 'NV'} • ${employee.position || 'Nhân sự'}`
        : undefined,
      data: employee,
      tabs: [
        {
          key: 'profile',
          label: 'Thông tin chung',
          fields: [
            {
              key: 'avatar',
              label: 'Ảnh đại diện',
              type: 'avatar',
              colSpan: 24,
            },
            {
              key: 'title_work',
              type: 'title',
              titleConfig: { text: 'Thông tin công việc & Vị trí', divider: true },
              colSpan: 24,
            },
            {
              key: 'code',
              label: 'Mã nhân viên',
              type: 'badge',
              colSpan: 12,
            },
            {
              key: 'status',
              label: 'Trạng thái nhân sự',
              type: 'status',
              colSpan: 12,
            },
            {
              key: 'departmentName',
              label: 'Phòng ban trực thuộc',
              type: 'text',
              colSpan: 12,
            },
            {
              key: 'position',
              label: 'Chức danh / Vị trí',
              type: 'text',
              colSpan: 12,
            },
            {
              key: 'joinDate',
              label: 'Ngày vào làm',
              type: 'date',
              colSpan: 12,
            },
            {
              key: 'salary',
              label: 'Mức lương cơ bản',
              type: 'money',
              colSpan: 12,
            },
            {
              key: 'title_contact',
              type: 'title',
              titleConfig: { text: 'Thông tin liên hệ cá nhân', divider: true },
              colSpan: 24,
            },
            {
              key: 'email',
              label: 'Email công ty',
              type: 'email',
              colSpan: 12,
            },
            {
              key: 'phone',
              label: 'Số điện thoại',
              type: 'text',
              colSpan: 12,
            },
            {
              key: 'address',
              label: 'Địa chỉ thường trú / tạm trú',
              type: 'textarea',
              placeholder: 'Chưa có thông tin địa chỉ',
              colSpan: 24,
            },
          ],
        },
        {
          key: 'compensation',
          label: 'Hợp đồng & Đãi ngộ',
          fields: [
            {
              key: 'title_compensation',
              type: 'title',
              titleConfig: { text: 'Chính sách lương & Phụ cấp', divider: true },
              colSpan: 24,
            },
            {
              key: 'salary',
              label: 'Lương ký kết hợp đồng',
              type: 'money',
              colSpan: 12,
            },
            {
              key: 'contractType',
              label: 'Loại hợp đồng',
              type: 'text',
              colSpan: 12,
              render: () => 'Hợp đồng lao động chính thức',
            },
            {
              key: 'insuranceSalary',
              label: 'Mức đóng BHXH',
              type: 'money',
              colSpan: 12,
              render: (_v, d) => (d?.salary ? Number(d.salary) * 0.8 : 5000000),
            },
            {
              key: 'lunchAllowance',
              label: 'Phụ cấp ăn trưa',
              type: 'money',
              colSpan: 12,
              render: () => 730000,
            },
          ],
        },
      ],
      actions: [
        {
          key: 'edit',
          label: 'Chỉnh sửa thông tin',
          icon: <EditOutlined />,
          type: 'primary',
          onClick: (data) => onEdit(data),
        },
        {
          key: 'delete',
          label: 'Xóa nhân viên',
          icon: <DeleteOutlined />,
          danger: true,
          confirm: {
            title: 'Xóa nhân viên',
            description: `Bạn có chắc chắn muốn xóa nhân viên ${employee?.fullName}?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
          },
          onClick: (data) => onDelete(data.id),
        },
      ],
    }),
    [employee, onEdit, onDelete]
  );

  return (
    <DynamicViewSidebar<Employee>
      config={viewConfig}
      open={open}
      onClose={onClose}
      data={employee}
      navigationIds={employees.map((e) => e.id)}
      currentIndex={employees.findIndex((e) => e.id === employee?.id)}
      totalCount={employees.length}
      onNavigate={(_id, idx) => onNavigate(idx)}
    />
  );
};

export default EmployeeView;
