import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import { useAppSelector } from '@/store';
import { useTranslation } from '@/locales';
import type { Role } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: readonly Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const role = useAppSelector((state) => state.auth.user?.role);
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && (!role || !allowedRoles.includes(role))) {
    return (
      <Result
        status="403"
        title={t.errors.forbiddenTitle}
        subTitle={t.errors.forbiddenDescription}
        extra={<Button type="primary" onClick={() => navigate('/')}>{t.errors.backToDashboard}</Button>}
      />
    );
  }

  return <>{children}</>;
};
