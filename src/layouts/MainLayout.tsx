import React, { useMemo, useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Switch,
  Drawer,
  theme as antdTheme,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  GlobalOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { toggleSidebar, setSidebarCollapsed, toggleTheme } from '@/store/slices/themeSlice';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation, type SupportedLocale } from '@/locales';
import type { User } from '@/types';
import { HeaderNotification } from '@/components/common/HeaderNotification';
import {
  appNavigations,
  filterNavItemsByRole,
  transformToAntdMenuItems,
} from '@/routes/appNavigation';

const { Header, Sider, Content } = Layout;

const HeaderThemeSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);
  const { t } = useTranslation();

  return (
    <div className="theme-toggle-pill" title={t.header.theme}>
      <SunOutlined className={!isDarkMode ? 'is-active' : ''} />
      <Switch
        size="small"
        checked={isDarkMode}
        onChange={() => dispatch(toggleTheme())}
        aria-label={t.header.theme}
      />
      <MoonOutlined className={isDarkMode ? 'is-active' : ''} />
    </div>
  );
};

const HeaderLanguageDropdown: React.FC = () => {
  const { locale, setLocale, t } = useTranslation();
  const items: MenuProps['items'] = [
    { key: 'vi', label: 'Tiếng Việt' },
    { key: 'en', label: 'English' },
  ];

  return (
    <Dropdown
      menu={{
        items,
        selectedKeys: [locale],
        onClick: ({ key }) => setLocale(key as SupportedLocale),
      }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        className="header-language-btn"
        aria-label={t.header.language}
        title={t.header.language}
      >
        <GlobalOutlined />
        <span>{locale.toUpperCase()}</span>
        <DownOutlined className="header-language-caret" />
      </Button>
    </Dropdown>
  );
};

type HeaderProfileMenuProps = {
  user: User | null;
  onLogout: () => void;
};

const HeaderProfileMenu: React.FC<HeaderProfileMenuProps> = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const { token } = antdTheme.useToken();
  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div className="header-profile-info">
          <strong>{user?.name || t.header.administrator}</strong>
          {user?.email && <span>{user.email}</span>}
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t.header.logout,
      danger: true,
      onClick: onLogout,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <button
        type="button"
        className="header-avatar-trigger"
        aria-label={t.header.profile}
        title={t.header.profile}
      >
        <Avatar
          src={user?.avatar}
          icon={<UserOutlined />}
          size={32}
          style={{ backgroundColor: token.colorPrimary }}
        />
      </button>
    </Dropdown>
  );
};

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isMobile, isTablet } = useResponsive();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [manuallyOpenKeys, setManuallyOpenKeys] = useState<string[]>([]);

  // Active Ant Design design tokens
  const { token } = antdTheme.useToken();

  const user = useAppSelector((state) => state.auth.user);
  const { collapsedSidebar, isDarkMode } = useAppSelector((state) => state.theme);
  const { t } = useTranslation();

  // Auto-collapse sidebar on tablet viewports to maximize workspace breathing room
  useEffect(() => {
    if (isTablet && !collapsedSidebar) {
      dispatch(setSidebarCollapsed(true));
    }
  }, [isTablet, collapsedSidebar, dispatch]);

  // Dynamic menu items filtered by user role and support parent/child hierarchy
  const filteredNavItems = useMemo(
    () => filterNavItemsByRole(appNavigations, user?.role),
    [user?.role]
  );

  const menuItems = useMemo(
    () => transformToAntdMenuItems(filteredNavItems, t.navigation),
    [filteredNavItems, t.navigation]
  );

  // Determine current active and open keys
  const currentKey = location.pathname;
  const openKeys = useMemo(() => {
    const routeKeys = currentKey.startsWith('/employees') ? ['/employees-group'] : [];
    return [...new Set([...manuallyOpenKeys, ...routeKeys])];
  }, [currentKey, manuallyOpenKeys]);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (isMobile) {
      setMobileNavOpen(false);
    }
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
            openKeys={collapsedSidebar ? [] : openKeys}
            onOpenChange={setManuallyOpenKeys}
            items={menuItems}
            onClick={handleMenuClick}
            className="hrm-sidebar-menu"
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
          {/* Left: Sidebar Collapse Trigger (Desktop: collapse toggle, Mobile: open drawer) */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={
                isMobile ? (
                  <MenuOutlined style={{ fontSize: 16, color: token.colorTextHeading }} />
                ) : collapsedSidebar ? (
                  <MenuUnfoldOutlined style={{ fontSize: 16, color: token.colorTextHeading }} />
                ) : (
                  <MenuFoldOutlined style={{ fontSize: 16, color: token.colorTextHeading }} />
                )
              }
              onClick={() => {
                if (isMobile) {
                  setMobileNavOpen(true);
                } else {
                  dispatch(toggleSidebar());
                }
              }}
              className="btn-icon-hairline"
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
              title={isMobile ? t.header.openMenu : t.header.closeMenu}
              aria-label={isMobile ? t.header.openMenu : t.header.closeMenu}
            />
          </div>

          {/* Header controls are separate components so each can grow independently. */}
          <Space className="hrm-header-actions" size={isMobile ? 6 : 10} align="center">
            <HeaderNotification />
            <HeaderLanguageDropdown />
            <HeaderThemeSwitcher />
            <HeaderProfileMenu user={user} onLogout={handleLogout} />
          </Space>
        </Header>

        {/* Content Area */}
        <Content className="hrm-content-container">
          <Outlet />
        </Content>
      </Layout>

      {/* Mobile Off-canvas Navigation Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          width={280}
          styles={{
            body: { padding: 0, background: token.colorBgContainer },
            header: { borderBottom: `1px solid ${token.colorBorderSecondary}`, padding: '12px 16px' },
          }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="hrm-logo-icon">H</div>
              <div>
                <div className="hrm-brand-title" style={{ color: token.colorTextHeading }}>
                  HRM Portal
                </div>
                <div className="hrm-brand-tag" style={{ color: token.colorTextSecondary }}>
                  Enterprise
                </div>
              </div>
            </div>
          }
        >
          <div className="hrm-sidebar-menu-wrap">
            <Menu
              mode="inline"
              selectedKeys={[currentKey]}
              openKeys={openKeys}
              onOpenChange={setManuallyOpenKeys}
              items={menuItems}
              onClick={handleMenuClick}
              className="hrm-sidebar-menu"
            />
          </div>
        </Drawer>
      )}
    </Layout>
  );
};
