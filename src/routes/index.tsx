import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { EmployeeListPage } from '@/features/employees/EmployeeListPage';
import { DepartmentListPage } from '@/features/departments/DepartmentListPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { APP_ROUTE_ROLES } from './appNavigation';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected HRM Layout Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProtectedRoute allowedRoles={APP_ROUTE_ROLES.dashboard}><DashboardPage /></ProtectedRoute>} />
        <Route path="employees" element={<ProtectedRoute allowedRoles={APP_ROUTE_ROLES.employees}><EmployeeListPage /></ProtectedRoute>} />
        <Route path="departments" element={<ProtectedRoute allowedRoles={APP_ROUTE_ROLES.departments}><DepartmentListPage /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
