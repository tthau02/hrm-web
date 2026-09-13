import React from 'react';
import { Row, Col, Card, Typography, Space, Avatar, Spin } from 'antd';
import {
  ApartmentOutlined,
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageHeader } from '@/components/common/PageHeader';
import { useDepartmentsQuery } from '@/hooks/useHrmQuery';

const { Text, Paragraph } = Typography;

export const DepartmentListPage: React.FC = () => {
  const { data: deptResponse, isLoading } = useDepartmentsQuery();
  const departments = deptResponse?.data || [];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải danh sách phòng ban..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Quản lý Phòng ban"
        actions={[
          {
            key: 'add-dept',
            label: 'Thêm phòng ban mới',
            icon: <PlusOutlined />,
            variant: 'primary',
            onClick: () => window.alert('Mở form tạo phòng ban'),
          },
        ]}
      />

      <Row gutter={[16, 16]}>
        {departments.map((dept) => (
          <Col xs={24} sm={12} lg={8} key={dept.id}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                border: '1px solid #e6e5e0',
                background: '#ffffff',
                boxShadow: 'none',
                height: '100%',
                transition: 'border-color 0.2s ease',
              }}
              bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: '#fafaf7',
                    color: '#26251e',
                    border: '1px solid #e6e5e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}
                >
                  <ApartmentOutlined />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    background: '#efeee8',
                    color: '#26251e',
                    border: '1px solid #e6e5e0',
                    padding: '2px 8px',
                    borderRadius: 9999,
                  }}
                >
                  {dept.code}
                </span>
              </div>

              <div
                style={{
                  marginTop: 16,
                  marginBottom: 6,
                  fontWeight: 500,
                  fontSize: 16,
                  color: '#26251e',
                  letterSpacing: '-0.01em',
                }}
              >
                {dept.name}
              </div>

              <Paragraph
                style={{ fontSize: 13, minHeight: 40, marginBottom: 16, color: '#5a5852' }}
              >
                {dept.description}
              </Paragraph>

              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #efeee8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: '#807d72' }}>
                    Trưởng phòng
                  </Text>
                  <Space size={6}>
                    <Avatar size={18} icon={<UserOutlined />} style={{ backgroundColor: '#26251e' }} />
                    <span style={{ fontSize: 13, color: '#26251e', fontWeight: 500 }}>
                      {dept.managerName}
                    </span>
                  </Space>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#807d72' }}>
                    Quy mô nhân sự
                  </Text>
                  <Space size={4}>
                    <TeamOutlined style={{ color: '#f54e00' }} />
                    <span style={{ fontSize: 13, color: '#f54e00', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {dept.employeeCount} nhân sự
                    </span>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
