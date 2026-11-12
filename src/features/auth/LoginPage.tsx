import React, { useState } from 'react';
import axios from 'axios';
import { Card, Input, Button, Typography, Space, Alert, Tag, theme as antdTheme } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';
import { authApi } from '@/api/endpoints';
import { colors } from '@/theme';

const { Title, Text, Paragraph } = Typography;

interface LoginFormInputs {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = antdTheme.useToken();
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
      email: 'admin@sasco.vn',
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
        backgroundColor: token.colorBgLayout,
        padding: 16,
      }}
    >
      <Card
        variant="borderless"
        style={{
          width: 440,
          maxWidth: '100%',
          borderRadius: 16,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
        styles={{ body: { padding: '36px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: colors.brand.gold,
              color: colors.text.inkLight,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            S
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: token.colorTextHeading }}>
            SASCO WMS
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 6, fontSize: 13 }}>
            Hệ thống quản lý kho hàng miễn thuế
          </Paragraph>
        </div>

        {errorMsg && <Alert message={errorMsg} type="error" showIcon style={{ marginBottom: 20 }} />}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="wms-field">
            <label className="wms-field-label" htmlFor="login-email">Email</label>
            <Controller
              name="email"
              control={control}
              rules={{ required: 'Vui lòng nhập email' }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="login-email"
                  prefix={<UserOutlined style={{ color: '#5d6c7b' }} />}
                  size="large"
                  placeholder="name@sasco.vn"
                />
              )}
            />
            {errors.email && (
              <Text type="danger" style={{ fontSize: 12 }}>{errors.email.message}</Text>
            )}
          </div>

          <div className="wms-field" style={{ marginBottom: 28 }}>
            <label className="wms-field-label" htmlFor="login-password">Mật khẩu</label>
            <Controller
              name="password"
              control={control}
              rules={{ required: 'Vui lòng nhập mật khẩu' }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  id="login-password"
                  prefix={<LockOutlined style={{ color: '#5d6c7b' }} />}
                  size="large"
                  placeholder="••••••••"
                />
              )}
            />
            {errors.password && (
              <Text type="danger" style={{ fontSize: 12 }}>{errors.password.message}</Text>
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
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            textAlign: 'center',
          }}
        >
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            <SafetyCertificateOutlined style={{ marginRight: 4 }} />
            Tài khoản demo:
          </Text>
          <Space wrap>
            <Tag
              color="blue"
              style={{ cursor: 'pointer', padding: '4px 8px' }}
              onClick={() => handleQuickFill('admin@sasco.vn')}
            >
              Admin: admin@sasco.vn
            </Tag>
            <Tag
              color="gold"
              style={{ cursor: 'pointer', padding: '4px 8px' }}
              onClick={() => handleQuickFill('warehouse@sasco.vn')}
            >
              Quản lý kho: warehouse@sasco.vn
            </Tag>
          </Space>
        </div>
      </Card>
    </div>
  );
};
