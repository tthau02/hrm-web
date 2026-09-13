import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { EmployeeListPage } from '@/features/employees/EmployeeListPage';
import { DepartmentListPage } from '@/features/departments/DepartmentListPage';
import { AttendancePage } from '@/features/attendance/AttendancePage';
import { LoginPage } from '@/features/auth/LoginPage';

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
        <Route index element={<DashboardPage />} />
        <Route path="employees" element={<EmployeeListPage />} />
        <Route path="departments" element={<DepartmentListPage />} />
        <Route path="attendance" element={<AttendancePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
