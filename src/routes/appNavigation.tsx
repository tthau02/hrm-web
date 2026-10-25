import type { ReactNode } from 'react';
import type { ItemType } from 'antd/es/menu/interface';
import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { Role } from '@/types';
import type { TranslationSchema } from '@/locales';

type NavigationLabelKey = keyof TranslationSchema['navigation'];

export const APP_ROUTE_ROLES = {
  dashboard: ['admin', 'hr_manager', 'employee'],
  employees: ['admin', 'hr_manager'],
  departments: ['admin', 'hr_manager', 'employee'],
} satisfies Record<string, Role[]>;

export interface AppNavItem {
  key: string;
  labelKey: NavigationLabelKey;
  path?: string;
  icon?: ReactNode;
  roles?: Role[];
  children?: AppNavItem[];
}

export const appNavigations: AppNavItem[] = [
  {
    key: '/',
    path: '/',
    labelKey: 'dashboard',
    icon: <DashboardOutlined style={{ fontSize: 16 }} />,
    roles: APP_ROUTE_ROLES.dashboard,
  },
  {
    key: '/employees-group',
    labelKey: 'employeesGroup',
    icon: <TeamOutlined style={{ fontSize: 16 }} />,
    roles: APP_ROUTE_ROLES.employees,
    children: [
      {
        key: '/employees',
        path: '/employees',
        labelKey: 'employees',
        icon: <UserOutlined style={{ fontSize: 15 }} />,
        roles: APP_ROUTE_ROLES.employees,
      },
    ],
  },
  {
    key: '/departments',
    path: '/departments',
    labelKey: 'departments',
    icon: <ApartmentOutlined style={{ fontSize: 16 }} />,
    roles: APP_ROUTE_ROLES.departments,
  },
];


export const filterNavItemsByRole = (
  items: AppNavItem[],
  userRole?: Role
): AppNavItem[] => {
  return items
    .map((item) => ({
      ...item,
      children: item.children ? filterNavItemsByRole(item.children, userRole) : undefined,
    }))
    .filter((item) => {
      const hasRoleAccess = !item.roles?.length || Boolean(userRole && item.roles.includes(userRole));
      const hasVisibleChildren = !item.children || item.children.length > 0;
      return hasRoleAccess && hasVisibleChildren;
    });
};

/**
 * Chuyển đổi cây AppNavItem sang định dạng Ant Design Menu Items
 */
export const transformToAntdMenuItems = (
  items: AppNavItem[],
  labels: TranslationSchema['navigation'],
): ItemType[] => {
  return items.map((item) => {
    if (item.children && item.children.length > 0) {
      return {
        key: item.key,
        icon: item.icon,
        label: <span style={{ whiteSpace: 'nowrap' }}>{labels[item.labelKey]}</span>,
        children: transformToAntdMenuItems(item.children, labels),
      };
    }

    return {
      key: item.key,
      icon: item.icon,
      label: <span style={{ whiteSpace: 'nowrap' }}>{labels[item.labelKey]}</span>,
    };
  });
};
