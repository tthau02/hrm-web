import React, { useEffect } from 'react';
import { Modal, Input, Select, InputNumber, Row, Col } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import type { Department, Employee, EmployeeStatus } from '@/types';

export interface EmployeeFormData {
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  position: string;
  status: EmployeeStatus;
  salary: number;
  joinDate?: string;
  address?: string;
}

interface EmployeeFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void> | void;
  initialData?: Employee | null;
  departments: Department[];
  loading?: boolean;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialData,
  departments,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      departmentId: departments[0]?.id || '',
      position: '',
      status: 'active',
      salary: 15000000,
      joinDate: new Date().toISOString().split('T')[0],
      address: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName,
        email: initialData.email,
        phone: initialData.phone,
        departmentId: initialData.departmentId,
        position: initialData.position,
        status: initialData.status,
        salary: initialData.salary,
        joinDate: initialData.joinDate,
        address: initialData.address || '',
      });
    } else {
      reset({
        fullName: '',
        email: '',
        phone: '',
        departmentId: departments[0]?.id || '',
        position: '',
        status: 'active',
        salary: 15000000,
        joinDate: new Date().toISOString().split('T')[0],
        address: '',
      });
    }
  }, [initialData, reset, departments]);

  const onFormSubmit = (data: EmployeeFormData) => {
    onSubmit(data);
  };

  return (
    <Modal
      title={
        <div className="text-ink" style={{ fontSize: 16, fontWeight: 500 }}>
          {initialData ? 'Cập nhật thông tin nhân viên' : 'Thêm mới nhân viên'}
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit(onFormSubmit)}
      confirmLoading={loading}
      okText={initialData ? 'Lưu thay đổi' : 'Thêm nhân viên'}
      cancelText="Hủy bỏ"
      width={680}
      destroyOnClose
      okButtonProps={{ className: 'btn-cursor-primary' }}
      cancelButtonProps={{ className: 'btn-hairline-secondary' }}
    >
      <form style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="modal-form-item-label">
              Họ và tên <span className="modal-form-required">*</span>
            </div>
            <Controller
              name="fullName"
              control={control}
              rules={{ required: 'Vui lòng nhập họ và tên' }}
              render={({ field }) => (
                <Input {...field} placeholder="Ví dụ: Nguyễn Văn A" size="large" />
              )}
            />
            {errors.fullName && (
              <div className="modal-form-error">{errors.fullName.message}</div>
            )}
          </Col>

          <Col span={12}>
            <div className="modal-form-item-label">
              Email công vụ <span className="modal-form-required">*</span>
            </div>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Vui lòng nhập email',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email không hợp lệ',
                },
              }}
              render={({ field }) => (
                <Input {...field} placeholder="example@hrm.vn" size="large" />
              )}
            />
            {errors.email && (
              <div className="modal-form-error">{errors.email.message}</div>
            )}
          </Col>

          <Col span={12}>
            <div className="modal-form-item-label">
              Số điện thoại <span className="modal-form-required">*</span>
            </div>
            <Controller
              name="phone"
              control={control}
              rules={{ required: 'Vui lòng nhập số điện thoại' }}
              render={({ field }) => (
                <Input {...field} placeholder="0912 345 678" size="large" />
              )}
            />
            {errors.phone && (
              <div className="modal-form-error">{errors.phone.message}</div>
            )}
          </Col>

          <Col span={12}>
            <div className="modal-form-item-label">
              Phòng ban <span className="modal-form-required">*</span>
            </div>
            <Controller
              name="departmentId"
              control={control}
              rules={{ required: 'Vui lòng chọn phòng ban' }}
              render={({ field }) => (
                <Select
                  {...field}
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="Chọn phòng ban"
                  options={departments.map((d) => ({
                    label: d.name,
                    value: d.id,
                  }))}
                />
              )}
            />
          </Col>

          <Col span={12}>
            <div className="modal-form-item-label">
              Vị trí công việc <span className="modal-form-required">*</span>
            </div>
            <Controller
              name="position"
              control={control}
              rules={{ required: 'Vui lòng nhập chức danh' }}
              render={({ field }) => (
                <Input {...field} placeholder="Ví dụ: Frontend Engineer" size="large" />
              )}
            />
            {errors.position && (
              <div className="modal-form-error">{errors.position.message}</div>
            )}
          </Col>

          <Col span={12}>
            <div className="modal-form-item-label">
              Mức lương cơ bản (VNĐ) <span className="modal-form-required">*</span>
            </div>
            <Controller
              name="salary"
              control={control}
              rules={{ required: 'Vui lòng nhập mức lương' }}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  style={{ width: '100%' }}
                  size="large"
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(val) => Number(val?.replace(/\$\s?|(,*)/g, ''))}
                  min={1000000}
                  step={1000000}
                />
              )}
            />
          </Col>

          <Col span={12}>
            <div className="modal-form-item-label">
              Trạng thái làm việc <span className="modal-form-required">*</span>
            </div>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  style={{ width: '100%' }}
                  size="large"
                  options={[
                    { label: 'Chính thức', value: 'active' },
                    { label: 'Thử việc', value: 'probation' },
                    { label: 'Nghỉ phép', value: 'on_leave' },
                    { label: 'Đã thôi việc', value: 'resigned' },
                  ]}
                />
              )}
            />
          </Col>

          <Col span={12}>
            <div className="modal-form-item-label">
              Địa chỉ cư trú
            </div>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Quận / Thành phố" size="large" />
              )}
            />
          </Col>
        </Row>
      </form>
    </Modal>
  );
};
