import React, { useState, useMemo, useCallback } from 'react';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  FilterBar,
  CommonTable,
  notify,
} from '@/components/common';
import type { CommonTableColumn } from '@/components/common';
import {
  useEmployeesQuery,
  useDepartmentsQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from '@/hooks/useHrmQuery';
import { EMPLOYEE_STATUS_OPTIONS } from '@/types';
import type { Employee, EmployeeStatus } from '@/types';

// Subcomponents: View & Create/Update
import { EmployeeView } from './EmployeeView';
import { EmployeeCreateOrUpdate } from './EmployeeCreateOrUpdate';

export const EmployeeListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState<string>('all');
  const [status, setStatus] = useState<EmployeeStatus | 'all'>('all');

  // Sidebar states
  const [viewSidebarOpen, setViewSidebarOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

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

  // Modal / Sidebar Handlers
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
      // Sync currently viewed employee if updated
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

  // Table Columns
  const columns: CommonTableColumn<Employee>[] = useMemo(
    () => [
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
    ],
    []
  );

  return (
    <div>
      {/* 1. Page Header */}
      <PageHeader
        title="Quản lý Nhân viên"
        actions={[
          {
            key: 'export-excel',
            label: 'Xuất Excel',
            icon: <ExportOutlined />,
            variant: 'secondary',
            onClick: () =>
              notify.success({
                title: 'Xuất Excel thành công',
                description: 'Dữ liệu danh sách nhân viên đã được trích xuất thành tệp Excel.',
              }),
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

      {/* 2. Filter Bar */}
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
            search: true,
            options: departments.map((d) => ({
              label: d.name,
              value: d.id,
            })),
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

      {/* 3. Table */}
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

      {/* 4. View Sidebar */}
      <EmployeeView
        open={viewSidebarOpen}
        onClose={() => setViewSidebarOpen(false)}
        employee={viewingEmployee}
        employees={employees}
        onEdit={(emp) => {
          setViewSidebarOpen(false);
          handleOpenEdit(emp);
        }}
        onDelete={handleDelete}
        onNavigate={(idx) => setViewingEmployee(employees[idx])}
      />

      {/* 5. Create or Update Sidebar */}
      <EmployeeCreateOrUpdate
        open={formSidebarOpen}
        onClose={() => setFormSidebarOpen(false)}
        employee={editingEmployee}
        departments={departments}
        onSubmit={handleFormSubmit}
        saving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export { EmployeeView } from './EmployeeView';
export { EmployeeCreateOrUpdate } from './EmployeeCreateOrUpdate';
export default EmployeeListPage;
