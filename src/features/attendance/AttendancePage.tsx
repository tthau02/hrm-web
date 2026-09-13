import React, { useState } from 'react';
import { Card, Table, Tag, Typography, Space, Button, DatePicker, Row, Col } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, StatCard, notify } from '@/components/common';
import { useEmployeesQuery } from '@/hooks/useHrmQuery';
import { useResponsive } from '@/hooks/useResponsive';

const { Text } = Typography;

interface AttendanceTableItem {
  key: string;
  code: string;
  name: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'on_time' | 'late' | 'leave';
  workHours: number;
}

export const AttendancePage: React.FC = () => {
  const { isMobile } = useResponsive();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { data: empResponse, isLoading } = useEmployeesQuery();
  const employees = empResponse?.data || [];

  // Generate dynamic attendance record based on employees
  const attendanceData: AttendanceTableItem[] = employees.map((emp, idx) => {
    let status: 'on_time' | 'late' | 'leave' = 'on_time';
    let checkIn = '08:24';
    let checkOut = '17:35';

    if (idx % 5 === 0) {
      status = 'late';
      checkIn = '08:45';
    } else if (idx % 8 === 0) {
      status = 'leave';
      checkIn = '--';
      checkOut = '--';
    }

    return {
      key: emp.id,
      code: emp.code,
      name: emp.fullName,
      department: emp.departmentName,
      date: selectedDate.format('DD/MM/YYYY'),
      checkIn,
      checkOut,
      status,
      workHours: status === 'leave' ? 0 : 8,
    };
  });

  const columns: ColumnsType<AttendanceTableItem> = [
    {
      title: 'Mã NV & Họ tên',
      key: 'name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.code}
          </Text>
        </div>
      ),
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Ngày làm việc',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Giờ vào (Check-in)',
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (val: string) => (
        <span style={{ fontWeight: 600, color: val === '--' ? '#94a3b8' : '#0f172a' }}>
          {val}
        </span>
      ),
    },
    {
      title: 'Giờ ra (Check-out)',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (val: string) => (
        <span style={{ fontWeight: 600, color: val === '--' ? '#94a3b8' : '#0f172a' }}>
          {val}
        </span>
      ),
    },
    {
      title: 'Số giờ làm',
      dataIndex: 'workHours',
      key: 'workHours',
      render: (hours: number) => <span>{hours}h</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'on_time') {
          return <Tag color="success">Đúng giờ</Tag>;
        }
        if (status === 'late') {
          return <Tag color="warning">Đi muộn</Tag>;
        }
        return <Tag color="error">Nghỉ phép</Tag>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý Chấm công & Điểm danh"
        subtitle="Theo dõi thời gian ra vào và tính công tự động theo ca"
        breadcrumbs={[{ title: 'Chấm công' }, { title: 'Bảng công ngày' }]}
        extra={
          <Space wrap style={{ width: isMobile ? '100%' : 'auto' }}>
            <DatePicker
              value={selectedDate}
              onChange={(d) => d && setSelectedDate(d)}
              format="DD/MM/YYYY"
              style={{ width: isMobile ? '100%' : 150 }}
            />
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() =>
                notify.success({
                  message: 'Chấm công thành công',
                  description: 'Hệ thống đã ghi nhận thời gian check-in của bạn hôm nay.',
                })
              }
              className="btn-cursor-primary"
              style={{
                width: isMobile ? '100%' : 'auto',
                height: 40,
              }}
            >
              Chấm công ngay
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <StatCard
            title="ĐÚNG GIỜ HÔM NAY"
            value="88.5%"
            icon={<CheckCircleOutlined />}
            iconBgColor="rgba(31, 138, 101, 0.08)"
            iconColor="#1f8a65"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="SỐ LƯỢT ĐI MUỘN"
            value="2 lượt"
            icon={<ClockCircleOutlined />}
            iconBgColor="rgba(192, 133, 50, 0.12)"
            iconColor="#c08532"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="NGHỈ PHÉP CÓ LÝ DO"
            value="1 người"
            icon={<CalendarOutlined />}
            iconBgColor="rgba(207, 45, 86, 0.08)"
            iconColor="#cf2d56"
          />
        </Col>
      </Row>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          border: '1px solid #e6e5e0',
          background: '#ffffff',
          boxShadow: 'none',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={attendanceData}
          loading={isLoading}
          scroll={{ x: 750 }}
          pagination={{
            pageSize: 8,
            size: isMobile ? 'small' : undefined,
          }}
        />
      </Card>
    </div>
  );
};
