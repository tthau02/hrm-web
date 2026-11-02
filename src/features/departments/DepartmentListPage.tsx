import React from 'react';
import { Row, Col, Card, Typography, Space, Avatar, Spin, Tag, theme as antdTheme } from 'antd';
import {
  ApartmentOutlined,
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageHeader, notify } from '@/components/common';
import { useDepartmentsQuery } from '@/hooks/useHrmQuery';

const { Text, Paragraph } = Typography;

export const DepartmentListPage: React.FC = () => {
  const { data: deptResponse, isLoading } = useDepartmentsQuery();
  const departments = deptResponse?.data || [];
  const { token } = antdTheme.useToken();

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
        title="Quản lý Phòng ban & Cơ cấu"
        subtitle="Danh sách các phòng ban, đơn vị trực thuộc và nhân sự phụ trách"
        actions={[
          {
            key: 'add-dept',
            label: 'Thêm phòng ban mới',
            icon: <PlusOutlined />,
            variant: 'primary',
            onClick: () =>
              notify.info({
                message: 'Thêm phòng ban mới',
                description: 'Biểu mẫu tạo phòng ban mới đang được cập nhật trong phiên bản tiếp theo.',
              }),
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
                border: `1px solid ${token.colorBorderSecondary}`,
                background: token.colorBgContainer,
                boxShadow: 'none',
                height: '100%',
                transition: 'border-color 0.2s ease',
              }}
              styles={{
                body: { padding: 22, display: 'flex', flexDirection: 'column', height: '100%' },
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar
                    size={42}
                    icon={<ApartmentOutlined />}
                    style={{
                      backgroundColor: 'rgba(245, 78, 0, 0.1)',
                      color: token.colorPrimary,
                      borderRadius: 10,
                      border: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  />
                  <div>
                    <Text strong style={{ fontSize: 16, color: token.colorTextHeading, display: 'block' }}>
                      {dept.name}
                    </Text>
                    <Tag
                      style={{
                        margin: '4px 0 0',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        borderRadius: 4,
                        border: 'none',
                        background: token.colorFillSecondary,
                        color: token.colorTextSecondary,
                      }}
                    >
                      {dept.code}
                    </Tag>
                  </div>
                </div>
              </div>

              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  color: token.colorTextSecondary,
                  lineHeight: 1.5,
                  minHeight: 40,
                }}
              >
                {dept.description || 'Chưa có mô tả cho phòng ban này.'}
              </Paragraph>

              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: 14,
                  borderTop: `1px solid ${token.colorBorderSecondary}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Space size={6} style={{ color: token.colorTextSecondary, fontSize: 13 }}>
                  <UserOutlined style={{ fontSize: 13 }} />
                  <span>Trưởng phòng:</span>
                  <Text strong style={{ color: token.colorTextHeading, fontSize: 13 }}>
                    {dept.managerName || 'Chưa bổ nhiệm'}
                  </Text>
                </Space>

                <Space size={4} style={{ color: token.colorPrimary, fontWeight: 600, fontSize: 13 }}>
                  <TeamOutlined />
                  <span>{dept.employeeCount}</span>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
