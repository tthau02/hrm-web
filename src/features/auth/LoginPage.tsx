import React, { useState } from 'react';
import axios from 'axios';
import { Card, Input, Button, Typography, Space, Alert, Tag } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';
import { authApi } from '@/api/endpoints';

const { Title, Text, Paragraph } = Typography;

interface LoginFormInputs {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: 'admin@hrm.vn',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await authApi.login(data);
      if (res.success && res.data) {
        dispatch(setCredentials(res.data));
        navigate('/');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
      } else {
        setErrorMsg('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        backgroundImage:
          'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.08) 0px, transparent 50%)',
        padding: 16,
      }}
    >
      <Card
        bordered={false}
        style={{
          width: 440,
          borderRadius: 16,
          boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        }}
        bodyStyle={{ padding: '36px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              marginBottom: 12,
            }}
          >
            <ApartmentOutlined />
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            HRM Enterprise
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 6, fontSize: 13 }}>
            Hệ thống Quản lý Nhân sự & Tiền lương Doanh nghiệp
          </Paragraph>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ marginBottom: 6 }}>
              <Text strong style={{ fontSize: 13 }}>
                Email công vụ
              </Text>
            </div>
            <Controller
              name="email"
              control={control}
              rules={{ required: 'Vui lòng nhập email công vụ' }}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                  size="large"
                  placeholder="name@hrm.vn"
                />
              )}
            />
            {errors.email && (
              <Text type="danger" style={{ fontSize: 12 }}>
                {errors.email.message}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 6 }}>
              <Text strong style={{ fontSize: 13 }}>
                Mật khẩu
              </Text>
            </div>
            <Controller
              name="password"
              control={control}
              rules={{ required: 'Vui lòng nhập mật khẩu' }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                  size="large"
                  placeholder="••••••••"
                />
              )}
            />
            {errors.password && (
              <Text type="danger" style={{ fontSize: 12 }}>
                {errors.password.message}
              </Text>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            style={{ height: 44, fontWeight: 600, fontSize: 15 }}
          >
            Đăng nhập hệ thống
          </Button>
        </form>

        <div
          style={{
            marginTop: 28,
            paddingTop: 16,
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
          }}
        >
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            <SafetyCertificateOutlined style={{ marginRight: 4 }} />
            Tài khoản Demo trải nghiệm nhanh:
          </Text>
          <Space>
            <Tag
              color="blue"
              style={{ cursor: 'pointer', padding: '4px 8px' }}
              onClick={() => handleQuickFill('admin@hrm.vn')}
            >
              Admin: admin@hrm.vn
            </Tag>
            <Tag
              color="green"
              style={{ cursor: 'pointer', padding: '4px 8px' }}
              onClick={() => handleQuickFill('hr@hrm.vn')}
            >
              HR Manager: hr@hrm.vn
            </Tag>
          </Space>
        </div>
      </Card>
    </div>
  );
};
