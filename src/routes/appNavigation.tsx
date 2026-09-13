import type { ReactNode } from 'react';
import type { ItemType } from 'antd/es/menu/interface';
import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  UserOutlined,
  IdcardOutlined,
  FileDoneOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import type { Role } from '@/types';

export interface AppNavItem {
  key: string;
  label: string;
  path?: string;
  icon?: ReactNode;
  roles?: Role[]; // Phân quyền role cho từng menu
  children?: AppNavItem[]; // Hỗ trợ menu cha, menu con
}

/**
 * Cấu hình cây điều hướng toàn hệ thống (Navigation Configuration)
 * Dễ dàng mở rộng, thay đổi icon, cấu trúc cha/con và phân quyền
 */
export const appNavigations: AppNavItem[] = [
  {
    key: '/',
    path: '/',
    label: 'Tổng quan (Dashboard)',
    icon: <DashboardOutlined style={{ fontSize: 16 }} />,
    roles: ['admin', 'hr_manager', 'employee'],
  },
  {
    key: '/employees-group',
    label: 'Quản lý Nhân sự',
    icon: <TeamOutlined style={{ fontSize: 16 }} />,
    roles: ['admin', 'hr_manager'],
    children: [
      {
        key: '/employees',
        path: '/employees',
        label: 'Danh sách nhân viên',
        icon: <UserOutlined style={{ fontSize: 15 }} />,
        roles: ['admin', 'hr_manager'],
      },
      {
        key: '/employees/contracts',
        path: '/employees',
        label: 'Hồ sơ & Hợp đồng',
        icon: <IdcardOutlined style={{ fontSize: 15 }} />,
        roles: ['admin', 'hr_manager'],
      },
    ],
  },
  {
    key: '/departments',
    path: '/departments',
    label: 'Phòng ban & Cơ cấu',
    icon: <ApartmentOutlined style={{ fontSize: 16 }} />,
    roles: ['admin', 'hr_manager', 'employee'],
  },
  {
    key: '/attendance-group',
    label: 'Chấm công & Điểm danh',
    icon: <CalendarOutlined style={{ fontSize: 16 }} />,
    roles: ['admin', 'hr_manager', 'employee'],
    children: [
      {
        key: '/attendance',
        path: '/attendance',
        label: 'Bảng công ngày',
        icon: <ScheduleOutlined style={{ fontSize: 15 }} />,
        roles: ['admin', 'hr_manager', 'employee'],
      },
      {
        key: '/attendance/requests',
        path: '/attendance',
        label: 'Đơn xin nghỉ phép',
        icon: <FileDoneOutlined style={{ fontSize: 15 }} />,
        roles: ['admin', 'hr_manager', 'employee'],
      },
    ],
  },
];

/**
 * Hàm lọc menu theo quyền (Roles) của người dùng hiện tại
 */
export const filterNavItemsByRole = (
  items: AppNavItem[],
  userRole?: Role
): AppNavItem[] => {
  return items
    .filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      if (!userRole) return false;
      return item.roles.includes(userRole);
    })
    .map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterNavItemsByRole(item.children, userRole),
        };
      }
      return item;
    });
};

/**
 * Chuyển đổi cây AppNavItem sang định dạng Ant Design Menu Items
 */
export const transformToAntdMenuItems = (
  items: AppNavItem[]
): ItemType[] => {
  return items.map((item) => {
    if (item.children && item.children.length > 0) {
      return {
        key: item.key,
        icon: item.icon,
        label: <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>,
        children: transformToAntdMenuItems(item.children),
      };
    }

    return {
      key: item.key,
      icon: item.icon,
      label: <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>,
    };
  });
};
