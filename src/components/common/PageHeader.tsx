import React from 'react';
import { Breadcrumb, Button, Space, Typography, theme as antdTheme } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Paragraph } = Typography;

export interface BreadcrumbItem {
  title?: string;
  label?: string; // Alias for title
  path?: string;
}

export interface HeaderActionItem {
  key?: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  variant?: 'primary' | 'secondary' | 'danger';
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: HeaderActionItem[];
  primaryAction?: HeaderActionItem;
  secondaryActions?: HeaderActionItem[];
  extra?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  titleSize?: number | string;
}

/**
 * Common PageHeader component:
 * - Left: Title (and optional subtitle/breadcrumb)
 * - Right: Action buttons configured via objects (actions) or ReactNode (extra)
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions = [],
  primaryAction,
  secondaryActions,
  extra,
  className = '',
  style,
  titleSize = 20,
}) => {
  const { token } = antdTheme.useToken();

  // Combine actions: secondaryActions, actions, and primaryAction (prominent on the right)
  const resolvedPrimary: HeaderActionItem | undefined = primaryAction
    ? {
        ...primaryAction,
        variant: primaryAction.variant || 'primary',
        type: primaryAction.type || 'primary',
      }
    : undefined;

  const allActions: HeaderActionItem[] = [
    ...(secondaryActions || []),
    ...actions,
    ...(resolvedPrimary ? [resolvedPrimary] : []),
  ];

  // Render an individual action button from configuration object
  const renderAction = (action: HeaderActionItem, index: number) => {
    const isPrimary = action.variant === 'primary' || action.type === 'primary';
    const isDanger = action.variant === 'danger' || action.danger;

    const defaultClass = isPrimary
      ? 'btn-cursor-primary'
      : isDanger
        ? ''
        : 'btn-hairline-secondary';

    const defaultStyle: React.CSSProperties = isPrimary
      ? {}
      : {
        background: token.colorBgContainer,
        borderColor: token.colorBorderSecondary,
        color: token.colorTextHeading,
      };

    return (
      <Button
        key={action.key || `action-${index}`}
        type={action.type || (isPrimary ? 'primary' : 'default')}
        icon={action.icon}
        danger={isDanger}
        disabled={action.disabled}
        loading={action.loading}
        onClick={action.onClick}
        title={action.title}
        className={`${defaultClass} ${action.className || ''}`.trim()}
        style={{ ...defaultStyle, ...action.style }}
      >
        {action.label}
      </Button>
    );
  };

  return (
    <div className={`common-page-header ${className}`.trim()} style={{ marginBottom: 16, ...style }}>
      {/* Optional Breadcrumb Navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: 6, fontSize: 12 }}
          items={[
            {
              title: (
                <Link
                  to="/"
                  style={{
                    color: token.colorTextSecondary,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <HomeOutlined style={{ marginRight: 4, fontSize: 11 }} />
                  Trang chủ
                </Link>
              ),
            },
            ...breadcrumbs.map((b) => {
              const labelText = b.title || b.label || '';
              return {
                title: b.path ? (
                  <Link to={b.path} style={{ color: token.colorTextSecondary }}>
                    {labelText}
                  </Link>
                ) : (
                  <span style={{ color: token.colorTextHeading, fontWeight: 500 }}>
                    {labelText}
                  </span>
                ),
              };
            }),
          ]}
        />
      )}

      {/* Main Header Row: Left Title - Right Actions */}
      <div
        className="common-page-header-content"
        style={{
          display: 'flex',
          alignItems: subtitle ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Left: Title & Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {typeof title === 'string' ? (
            <h1
              style={{
                margin: 0,
                fontSize: titleSize,
                fontWeight: 500,
                color: token.colorTextHeading,
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
                fontFamily: 'var(--font-sans)',
              }}
            >
              {title}
            </h1>
          ) : (
            title
          )}

          {subtitle && (
            <div style={{ marginTop: 4 }}>
              {typeof subtitle === 'string' ? (
                <Paragraph
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: token.colorTextSecondary,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {subtitle}
                </Paragraph>
              ) : (
                subtitle
              )}
            </div>
          )}
        </div>

        {/* Right: Action Buttons (Object config or Extra ReactNode) */}
        {(allActions.length > 0 || extra) && (
          <div className="common-page-header-actions">
            <Space size="middle" wrap>
              {allActions.map((act, idx) => renderAction(act, idx))}
              {extra}
            </Space>
          </div>
        )}
      </div>
    </div>
  );
};
