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
  useCrudModal,
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

  // Unified CRUD Modal & Drawer State
  const {
    viewOpen: viewSidebarOpen,
    selectedRecord: viewingEmployee,
    handleOpenView: handleViewEmployee,
    handleCloseView: handleCloseViewSidebar,
    formOpen: formSidebarOpen,
    editingRecord: editingEmployee,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseForm: handleCloseFormSidebar,
    handleNavigate,
    syncUpdatedRecord,
  } = useCrudModal<Employee>();

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
      syncUpdatedRecord(payload, 'id');
    } else {
      await createMutation.mutateAsync(payload);
    }
    handleCloseFormSidebar();
  };

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
      if (viewingEmployee?.id === id) {
        handleCloseViewSidebar();
      }
    },
    [deleteMutation, viewingEmployee?.id, handleCloseViewSidebar]
  );

  // Table Columns
  const columns: CommonTableColumn<Employee>[] = useMemo(
    () => [
      {
        title: 'Mã NV & Họ tên',
        key: 'name',
        width: 280,
        action: (record) => handleViewEmployee(record),
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
        width: 150,
        mono: true,
        allowSort: true,
      },
      {
        title: 'Mức lương cơ bản',
        dataIndex: 'salary',
        type: 'money',
        width: 160,
        bold: true,
        allowSort: true,
      },
      {
        title: 'Ngày vào làm',
        dataIndex: 'joinDate',
        type: 'date',
        width: 140,
        allowSort: true,
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        type: 'status',
        width: 140,
        allowSort: true,
      },
    ],
    [handleViewEmployee]
  );

  return (
    <div>
      {/* 1. Page Header */}
      <PageHeader
        title="Quản lý Nhân viên"
        primaryAction={{
          key: 'add-employee',
          label: 'Thêm nhân viên mới',
          icon: <UserAddOutlined />,
          onClick: handleOpenAdd,
        }}
        secondaryActions={[
          {
            key: 'export-excel',
            label: 'Xuất Excel',
            icon: <ExportOutlined />,
            onClick: () =>
              notify.success({
                title: 'Xuất Excel thành công',
                description: 'Dữ liệu danh sách nhân viên đã được trích xuất thành tệp Excel.',
              }),
          },
        ]}
      />

      {/* 2. Filter Bar */}
      <FilterBar
        fields={[
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
              title: 'Xác nhận xóa',
              description: `Bạn có chắc muốn xóa nhân sự ${record.fullName}? Thao tác này không thể hoàn tác.`,
              okText: 'Xóa nhân viên',
              cancelText: 'Hủy bỏ',
              onConfirm: () => handleDelete(record.id),
            },
          },
        ]}
      />

      {/* 4. Detail View Sidebar */}
      <EmployeeView
        open={viewSidebarOpen}
        onClose={handleCloseViewSidebar}
        employee={viewingEmployee}
        employees={employees}
        onEdit={(emp) => {
          handleCloseViewSidebar();
          handleOpenEdit(emp);
        }}
        onDelete={handleDelete}
        onNavigate={(idx) => handleNavigate(idx, employees)}
      />

      {/* 5. Create or Update Sidebar */}
      <EmployeeCreateOrUpdate
        open={formSidebarOpen}
        onClose={handleCloseFormSidebar}
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
