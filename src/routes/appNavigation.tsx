import type { ReactNode } from 'react';
import type { ItemType } from 'antd/es/menu/interface';
import { InboxOutlined, ShopOutlined } from '@ant-design/icons';
import type { Role } from '@/types';
import type { TranslationSchema } from '@/locales';

type NavigationLabelKey = keyof TranslationSchema['navigation'];

export const APP_ROUTE_ROLES = {
  products: ['admin', 'warehouse_manager', 'staff'],
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
    key: '/warehouse-group',
    labelKey: 'warehouseGroup',
    icon: <ShopOutlined style={{ fontSize: 16 }} />,
    roles: APP_ROUTE_ROLES.products,
    children: [
      {
        key: '/products',
        path: '/products',
        labelKey: 'products',
        icon: <InboxOutlined style={{ fontSize: 15 }} />,
        roles: APP_ROUTE_ROLES.products,
      },
    ],
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
