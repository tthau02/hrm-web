import React, { useState, useMemo, useCallback } from 'react';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  FilterBar,
  CommonTable,
  DynamicViewSidebar,
  DynamicFormSidebar,
} from '@/components/common';
import type {
  CommonTableColumn,
  DynamicViewConfig,
  DynamicFormConfig,
} from '@/components/common';
import {
  useEmployeesQuery,
  useDepartmentsQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from '@/hooks/useHrmQuery';
import { EMPLOYEE_STATUS_OPTIONS } from '@/types';
import type { Employee, EmployeeStatus } from '@/types';

export const EmployeeListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState<string>('all');
  const [status, setStatus] = useState<EmployeeStatus | 'all'>('all');

  // Dynamic View Sidebar state
  const [viewSidebarOpen, setViewSidebarOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Dynamic Form Sidebar state
  const [formSidebarOpen, setFormSidebarOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // TanStack Query
  const {
    data: empResponse,
    isLoading,
    refetch,
  } = useEmployeesQuery({
    search,
    departmentId: departmentId === 'all' ? undefined : departmentId,
    status: status === 'all' ? undefined : status,
  });

  const { data: deptResponse } = useDepartmentsQuery();
  const createMutation = useCreateEmployeeMutation();
  const updateMutation = useUpdateEmployeeMutation();
  const deleteMutation = useDeleteEmployeeMutation();

  const employees = empResponse?.data || [];
  const departments = useMemo(() => deptResponse?.data || [], [deptResponse?.data]);

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormSidebarOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormSidebarOpen(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee);
    setViewSidebarOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    const matchedDept = departments.find((d) => d.id === formData.departmentId);
    const payload = {
      ...formData,
      departmentName: matchedDept ? matchedDept.name : formData.departmentName,
    };

    if (editingEmployee) {
      await updateMutation.mutateAsync({
        id: editingEmployee.id,
        data: payload,
      });
      // Sync viewed employee if updated
      if (viewingEmployee?.id === editingEmployee.id) {
        setViewingEmployee((prev) => (prev ? { ...prev, ...payload } : null));
      }
    } else {
      await createMutation.mutateAsync(payload);
    }
    setFormSidebarOpen(false);
  };

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
      if (viewingEmployee?.id === id) {
        setViewSidebarOpen(false);
      }
    },
    [deleteMutation, viewingEmployee?.id]
  );

  // 1. Dynamic View Sidebar Configuration
  const viewConfig: DynamicViewConfig<Employee> = useMemo(() => ({
    title: viewingEmployee ? viewingEmployee.fullName : 'Chi tiết nhân viên',
    subtitle: viewingEmployee
      ? `${viewingEmployee.code || 'NV'} • ${viewingEmployee.position || 'Nhân sự'}`
      : undefined,
    data: viewingEmployee,
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
            render: (_v, d) => (d.salary ? Number(d.salary) * 0.8 : 5000000),
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
        onClick: (data) => {
          setViewSidebarOpen(false);
          handleOpenEdit(data);
        },
      },
      {
        key: 'delete',
        label: 'Xóa nhân viên',
        icon: <DeleteOutlined />,
        danger: true,
        confirm: {
          title: 'Xóa nhân viên',
          description: `Bạn có chắc chắn muốn xóa nhân viên ${viewingEmployee?.fullName}?`,
          okText: 'Xóa',
          cancelText: 'Hủy',
        },
        onClick: (data) => {
          handleDelete(data.id);
        },
      },
    ],
  }), [viewingEmployee, handleDelete]);

  // 2. Dynamic Form Sidebar Configuration
  const formConfig: DynamicFormConfig = useMemo(() => ({
    title: 'Thêm mới nhân viên',
    editTitle: 'Cập nhật thông tin nhân viên',
    isEdit: !!editingEmployee,
    data: editingEmployee
      ? {
          ...editingEmployee,
          departmentId: editingEmployee.departmentId || departments[0]?.id,
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
        required: 'Vui lòng nhập họ và tên nhân viên',
        placeholder: 'Ví dụ: Nguyễn Văn A',
        colSpan: 12,
      },
      {
        key: 'code',
        label: 'Mã nhân viên',
        type: 'text',
        placeholder: 'Ví dụ: EMP-009',
        colSpan: 12,
      },
      {
        key: 'email',
        label: 'Email công ty',
        type: 'email',
        required: 'Vui lòng nhập email hợp lệ',
        placeholder: 'Ví dụ: an.nguyen@hrm.vn',
        colSpan: 12,
      },
      {
        key: 'phone',
        label: 'Số điện thoại',
        type: 'text',
        required: 'Vui lòng nhập số điện thoại',
        placeholder: 'Ví dụ: 0987 654 321',
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
        required: 'Vui lòng chọn phòng ban',
        placeholder: 'Chọn phòng ban',
        options: departments.map((d) => ({ label: d.name, value: d.id })),
        colSpan: 12,
      },
      {
        key: 'position',
        label: 'Chức danh / Vị trí',
        type: 'text',
        required: 'Vui lòng nhập chức vụ',
        placeholder: 'Ví dụ: Chuyên viên Tuyển dụng',
        colSpan: 12,
      },
      {
        key: 'status',
        label: 'Trạng thái nhân sự',
        type: 'select',
        required: true,
        options: EMPLOYEE_STATUS_OPTIONS.filter((o) => o.value !== 'all'),
        colSpan: 12,
      },
      {
        key: 'salary',
        label: 'Mức lương cơ bản',
        type: 'money',
        required: 'Vui lòng nhập mức lương',
        colSpan: 12,
      },
      {
        key: 'joinDate',
        label: 'Ngày bắt đầu vào làm',
        type: 'date',
        required: 'Vui lòng chọn ngày vào làm',
        colSpan: 12,
      },
      {
        key: 'address',
        label: 'Địa chỉ thường trú / liên hệ',
        type: 'textarea',
        placeholder: 'Nhập địa chỉ liên hệ...',
        colSpan: 24,
      },
    ],
  }), [editingEmployee, departments]);

  // Table Columns
  const columns: CommonTableColumn<Employee>[] = [
    {
      title: 'Mã NV & Họ tên',
      key: 'name',
      width: 280,
      renderUser: (record) => ({
        avatar: record.avatar,
        name: record.fullName,
        code: record.code,
        subtext: record.email,
      }),
    },
    {
      title: 'Phòng ban & Chức danh',
      key: 'department',
      width: 250,
      renderTitleSubtitle: (record) => ({
        title: record.departmentName,
        subtitle: record.position,
      }),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      ellipsis: true,
      sorter: (a, b) => a.phone.localeCompare(b.phone),
    },
    {
      title: 'Mức lương cơ bản',
      dataIndex: 'salary',
      key: 'salary',
      width: 160,
      align: 'right',
      sorter: (a, b) => a.salary - b.salary,
      renderCurrency: true,
    },
    {
      title: 'Ngày vào làm',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 140,
      align: 'center',
      renderDate: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      renderStatus: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý Nhân viên"
        actions={[
          {
            key: 'export-excel',
            label: 'Xuất Excel',
            icon: <FileExcelOutlined />,
            variant: 'secondary',
            onClick: () => window.alert('Xuất báo cáo Excel thành công'),
          },
          {
            key: 'add-employee',
            label: 'Thêm nhân viên mới',
            icon: <UserAddOutlined />,
            variant: 'primary',
            onClick: handleOpenAdd,
          },
        ]}
      />

      {/* Filter Bar */}
      <FilterBar
        items={[
          {
            name: 'search',
            type: 'search',
            placeholder: 'Tìm theo tên, email, mã NV...',
          },
          {
            name: 'departmentId',
            type: 'select',
            placeholder: 'Tất cả phòng ban',
            options: [
              { label: 'Tất cả phòng ban', value: 'all' },
              ...departments.map((d) => ({
                label: d.name,
                value: d.id,
              })),
            ],
          },
          {
            name: 'status',
            type: 'select',
            placeholder: 'Tất cả trạng thái',
            options: EMPLOYEE_STATUS_OPTIONS,
          },
        ]}
        values={{
          search,
          departmentId,
          status,
        }}
        onChange={(name, val) => {
          if (name === 'search') setSearch(String(val ?? ''));
          if (name === 'departmentId') setDepartmentId(String(val ?? 'all'));
          if (name === 'status') setStatus((val as EmployeeStatus) || 'all');
        }}
        onSearch={() => refetch()}
        onReset={() => {
          setSearch('');
          setDepartmentId('all');
          setStatus('all');
          refetch();
        }}
        loading={isLoading}
      />

      {/* Common Table with Excel Freeze Panes (STT fixed left, Thao tác fixed right) */}
      <CommonTable<Employee>
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1300 }}
        pagination={{
          pageSize: 8,
          showTotal: (total) => `Tổng cộng ${total}`,
        }}
        actions={(record) => [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => handleViewEmployee(record),
          },
          {
            key: 'edit',
            label: 'Chỉnh sửa thông tin',
            icon: <EditOutlined />,
            onClick: () => handleOpenEdit(record),
          },
          {
            key: 'delete',
            label: 'Xóa nhân viên',
            icon: <DeleteOutlined />,
            danger: true,
            confirm: {
              title: 'Xóa nhân viên',
              description: `Bạn có chắc chắn muốn xóa nhân viên ${record.fullName}?`,
              onConfirm: () => handleDelete(record.id),
            },
          },
        ]}
      />

      {/* 1. Dynamic View Sidebar: Xem chi tiết nhân viên với điều hướng Next/Prev */}
      <DynamicViewSidebar<Employee>
        config={viewConfig}
        open={viewSidebarOpen}
        onClose={() => setViewSidebarOpen(false)}
        data={viewingEmployee}
        navigationIds={employees.map((e) => e.id)}
        currentIndex={employees.findIndex((e) => e.id === viewingEmployee?.id)}
        totalCount={employees.length}
        onNavigate={(_id, idx) => setViewingEmployee(employees[idx])}
      />

      {/* 2. Dynamic Form Sidebar: Thêm mới / Cập nhật nhân viên dạng sidebar tiện lợi */}
      <DynamicFormSidebar
        config={formConfig}
        open={formSidebarOpen}
        onClose={() => setFormSidebarOpen(false)}
        onSubmit={handleFormSubmit}
        saving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default EmployeeListPage;
