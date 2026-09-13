import React, { useMemo } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Badge,
  Typography,
  Switch,
  theme as antdTheme,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { toggleSidebar, toggleTheme } from '@/store/slices/themeSlice';
import {
  appNavigations,
  filterNavItemsByRole,
  transformToAntdMenuItems,
} from '@/routes/appNavigation';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Active Ant Design design tokens
  const { token } = antdTheme.useToken();

  const user = useAppSelector((state) => state.auth.user);
  const { collapsedSidebar, isDarkMode } = useAppSelector((state) => state.theme);

  // Dynamic menu items filtered by user role and support parent/child hierarchy
  const filteredNavItems = useMemo(
    () => filterNavItemsByRole(appNavigations, user?.role),
    [user?.role]
  );

  const menuItems = useMemo(
    () => transformToAntdMenuItems(filteredNavItems),
    [filteredNavItems]
  );

  // Determine current active and open keys
  const currentKey = location.pathname;
  const defaultOpenKeys = useMemo(() => {
    if (currentKey.startsWith('/employees')) return ['/employees-group'];
    if (currentKey.startsWith('/attendance')) return ['/attendance-group'];
    return [];
  }, [currentKey]);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key && e.key.startsWith('/')) {
      const findPath = (items: typeof appNavigations, key: string): string => {
        for (const item of items) {
          if (item.key === key) return item.path || item.key;
          if (item.children) {
            const childPath = findPath(item.children, key);
            if (childPath) return childPath;
          }
        }
        return key;
      };
      navigate(findPath(appNavigations, e.key));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '6px 8px' }}>
          <div style={{ fontWeight: 600, color: token.colorTextHeading, fontSize: 13 }}>
            {user?.name || 'Quản trị viên'}
          </div>
          <div style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 2 }}>
            {user?.email || 'admin@hrm.vn'}
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#cf2d56' }} />,
      label: <span style={{ color: '#cf2d56', fontWeight: 500 }}>Đăng xuất</span>,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      {/* Sidebar with Fresh, Bright Color Palette (Non-black, elegant and bright) */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsedSidebar}
        width={260}
        collapsedWidth={72}
        className="hrm-sidebar"
        theme={isDarkMode ? 'dark' : 'light'}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {/* Brand Header */}
        <div
          className={`hrm-sidebar-brand ${collapsedSidebar ? 'collapsed' : 'expanded'}`}
          style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
        >
          <div className="hrm-logo-icon">H</div>

          {!collapsedSidebar && (
            <div style={{ overflow: 'hidden' }}>
              <div
                className="hrm-brand-title"
                style={{ color: token.colorTextHeading }}
              >
                HRM Portal
              </div>
              <div
                className="hrm-brand-tag"
                style={{ color: token.colorTextSecondary }}
              >
                Enterprise
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Navigation Menu with Parent/Child Hierarchy & Role Permission */}
        <div className="hrm-sidebar-menu-wrap">
          <Menu
            mode="inline"
            selectedKeys={[currentKey]}
            defaultOpenKeys={defaultOpenKeys}
            items={menuItems}
            onClick={handleMenuClick}
            className="hrm-sidebar-menu"
            theme={isDarkMode ? 'dark' : 'light'}
          />
        </div>
      </Sider>

      {/* Main App Container */}
      <Layout style={{ background: token.colorBgLayout }}>
        {/* Redesigned Clean Header tied to Ant Design Token */}
        <Header
          className="hrm-header"
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {/* Left: Sidebar Collapse Trigger */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={
                collapsedSidebar ? (
                  <MenuUnfoldOutlined style={{ fontSize: 16, color: token.colorTextHeading }} />
                ) : (
                  <MenuFoldOutlined style={{ fontSize: 16, color: token.colorTextHeading }} />
                )
              }
              onClick={() => dispatch(toggleSidebar())}
              className="btn-icon-hairline"
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
              title="Đóng / Mở menu sidebar"
            />
          </div>

          {/* Right: Theme Switch, Notifications & User profile */}
          <Space size="middle" align="center">
            {/* Theme Toggle Switch with Sun/Moon indicator */}
            <div
              className="theme-toggle-pill"
              style={{
                background: isDarkMode ? '#262626' : '#f5f5f4',
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <SunOutlined
                style={{
                  fontSize: 13,
                  color: isDarkMode ? token.colorTextSecondary : '#f54e00',
                  transition: 'color 0.2s ease',
                }}
              />
              <Switch
                size="small"
                checked={isDarkMode}
                onChange={() => dispatch(toggleTheme())}
                style={{
                  backgroundColor: isDarkMode ? '#f54e00' : '#bfbfbf',
                }}
              />
              <MoonOutlined
                style={{
                  fontSize: 12,
                  color: isDarkMode ? '#f54e00' : token.colorTextSecondary,
                  transition: 'color 0.2s ease',
                }}
              />
            </div>

            {/* Notification Badge */}
            <Badge
              count={3}
              size="small"
              style={{
                backgroundColor: '#f54e00',
                boxShadow: 'none',
                fontWeight: 600,
                fontSize: 10,
              }}
            >
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined style={{ fontSize: 17, color: token.colorTextHeading }} />}
                className="btn-icon-hairline"
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              />
            </Badge>

            {/* Hairline Divider */}
            <div
              className="header-divider-line"
              style={{ background: token.colorBorderSecondary }}
            />

            {/* User Profile Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                className="hrm-user-chip"
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Avatar
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  size={28}
                  style={{
                    backgroundColor: isDarkMode ? '#2b2b2b' : '#f54e00',
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <Text style={{ fontSize: 13, fontWeight: 500, color: token.colorTextHeading }}>
                    {user?.name || 'Nguyễn Văn Quản Trị'}
                  </Text>
                  <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>
                    {user?.role === 'admin' ? 'Quản trị viên' : 'HR Manager'}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content Area */}
        <Content className="hrm-content-container">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
