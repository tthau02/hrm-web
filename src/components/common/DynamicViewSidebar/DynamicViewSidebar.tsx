import { useEffect, useCallback, useMemo } from 'react';
import {
  Drawer,
  Tabs,
  Row,
  Col,
  Button,
  Space,
  Tooltip,
  Modal,
  Spin,
  theme as antdTheme,
} from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  ExclamationCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { DynamicViewSidebarProps, ViewActionConfig, DynamicViewSection, ViewFieldConfig } from './types';
import { DynamicFieldDisplay } from './DynamicFieldDisplay';
import { useResponsive } from '@/hooks/useResponsive';

export function DynamicViewSidebar<T = any>({
  config,
  open,
  onClose,
  data: propData,
  loading = false,
  width = 720,
  placement = 'right',
  navigationIds = [],
  currentIndex = -1,
  totalCount = 0,
  onNavigate,
  onNext,
  onPrevious,
  className = '',
  style,
}: DynamicViewSidebarProps<T>) {
  const { token } = antdTheme.useToken();
  const { isMobile, screenWidth } = useResponsive();
  const activeData: T = (propData ?? config.data ?? ({} as T));

  // Dynamically calculate responsive drawer width (100% on mobile, max 95vw on tablet/desktop)
  const responsiveWidth = useMemo(() => {
    if (isMobile) return '100%';
    const numericWidth = typeof width === 'number' ? width : parseInt(String(width || 720), 10);
    return Math.min(numericWidth, Math.round(screenWidth * 0.95));
  }, [isMobile, width, screenWidth]);

  // Navigation handlers
  const canGoPrevious = currentIndex > 0;
  const canGoNext =
    currentIndex >= 0 &&
    (totalCount > 0 ? currentIndex < totalCount - 1 : currentIndex < navigationIds.length - 1);

  const handlePrevious = useCallback(() => {
    if (!canGoPrevious) return;
    const newIdx = currentIndex - 1;
    const id = navigationIds[newIdx];
    onPrevious?.(id, newIdx);
    onNavigate?.(id, newIdx);
  }, [canGoPrevious, currentIndex, navigationIds, onPrevious, onNavigate]);

  const handleNext = useCallback(() => {
    if (!canGoNext) return;
    const newIdx = currentIndex + 1;
    const id = navigationIds[newIdx];
    onNext?.(id, newIdx);
    onNavigate?.(id, newIdx);
  }, [canGoNext, currentIndex, navigationIds, onNext, onNavigate]);

  // Keyboard shortcut listener for Left/Right arrow record navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when inside inputs or textareas
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowLeft' && canGoPrevious) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight' && canGoNext) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, canGoPrevious, canGoNext, handlePrevious, handleNext]);

  // Action Click Handler with Confirmation modal support
  const handleActionClick = (action: ViewActionConfig<T>) => {
    if (action.confirm) {
      Modal.confirm({
        centered: action.confirm.centered ?? true,
        title: action.confirm.title,
        content: action.confirm.description,
        icon: <ExclamationCircleOutlined style={{ color: action.danger ? '#cf2d56' : token.colorPrimary }} />,
        okText: action.confirm.okText || 'Xác nhận',
        cancelText: action.confirm.cancelText || 'Hủy',
        okButtonProps: { danger: action.danger },
        onOk: () => action.onClick(activeData),
      });
    } else {
      action.onClick(activeData);
    }
  };

  // Header Title & Counter
  const renderHeader = () => {
    const title = config.title || 'Chi tiết thông tin';
    const subtitle =
      typeof config.subtitle === 'function' ? config.subtitle(activeData) : config.subtitle;

    const hasNav = navigationIds.length > 0 || totalCount > 0;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ minWidth: 0, paddingRight: 12 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: token.colorTextHeading,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 2 }}>
              {subtitle}
            </div>
          )}
        </div>

        <Space size={8} align="center">
          {hasNav && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 6px',
                borderRadius: 6,
                background: token.colorFillAlter,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Tooltip title="Bản ghi trước (Phím ←)">
                <Button
                  type="text"
                  size="small"
                  icon={<LeftOutlined style={{ fontSize: 11 }} />}
                  disabled={!canGoPrevious}
                  onClick={handlePrevious}
                  style={{ width: 24, height: 24 }}
                />
              </Tooltip>
              <span
                style={{
                  fontSize: 11.5,
                  fontFamily: 'var(--font-mono)',
                  color: token.colorTextSecondary,
                  padding: '0 4px',
                }}
              >
                {currentIndex >= 0 ? currentIndex + 1 : 1}/{totalCount || navigationIds.length || 1}
              </span>
              <Tooltip title="Bản ghi sau (Phím →)">
                <Button
                  type="text"
                  size="small"
                  icon={<RightOutlined style={{ fontSize: 11 }} />}
                  disabled={!canGoNext}
                  onClick={handleNext}
                  style={{ width: 24, height: 24 }}
                />
              </Tooltip>
            </div>
          )}

          {config.extraHeader && (
            typeof config.extraHeader === 'function' ? config.extraHeader(activeData) : config.extraHeader
          )}
        </Space>
      </div>
    );
  };

  // Render list of fields in grid
  const renderFieldList = (fields?: ViewFieldConfig<T>[], defaultCols = 2) => {
    if (!fields || fields.length === 0) return null;

    return (
      <Row gutter={[16, 4]}>
        {fields.map((field, idx) => {
          const isHidden =
            typeof field.hidden === 'function' ? field.hidden(activeData) : field.hidden;
          if (isHidden) return null;

          const fieldKey = (field.name || field.key || `field-${idx}`).trim();
          const defaultSpan = Math.round(24 / defaultCols);
          const span =
            field.span ??
            field.colSpan ??
            (field.type === 'title' || field.type === 'divider' ? 24 : defaultSpan);

          return (
            <Col key={fieldKey} span={span} xs={24} sm={span}>
              <DynamicFieldDisplay
                field={field}
                value={(activeData as any)?.[fieldKey]}
                data={activeData}
              />
            </Col>
          );
        })}
      </Row>
    );
  };

  // Render list of sections (grouped cards with titles and custom column grid)
  const renderSectionList = (sections?: DynamicViewSection<T>[]) => {
    if (!sections || sections.length === 0) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sections.map((section, sIdx) => {
          const cols = section.columns || 2;
          return (
            <div
              key={section.title || `sec-${sIdx}`}
              style={{
                borderRadius: 10,
                border: `1px solid ${token.colorBorderSecondary}`,
                background: token.colorBgContainer,
                padding: '16px 18px',
              }}
            >
              {section.title && (
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: token.colorTextHeading,
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  {section.title}
                </div>
              )}
              {renderFieldList(section.fields, cols)}
            </div>
          );
        })}
      </div>
    );
  };

  // Render Footer Actions
  const renderFooter = () => {
    const actions = config.actions || [];
    const visibleActions = actions.filter((act) => {
      if (typeof act.visible === 'function') return act.visible(activeData);
      return act.visible !== false;
    });

    return (
      <div
        className="drawer-footer-actions"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          width: '100%',
        }}
      >
        <Button onClick={onClose} style={{ minWidth: 110, height: 40, borderRadius: 8 }}>
          Đóng
        </Button>

        {visibleActions.map((act) => {
          const isDisabled =
            typeof act.disabled === 'function' ? act.disabled(activeData) : act.disabled;

          return (
            <Button
              key={act.key}
              type={act.type || (act.danger ? 'primary' : 'default')}
              danger={act.danger}
              icon={act.icon}
              disabled={isDisabled}
              loading={act.loading}
              onClick={() => handleActionClick(act)}
              className={act.type === 'primary' && !act.danger ? 'btn-cursor-primary' : undefined}
              style={{ minWidth: 120, height: 40 }}
            >
              {act.label}
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={responsiveWidth}
      placement={placement}
      title={renderHeader()}
      footer={renderFooter()}
      destroyOnClose
      closeIcon={<CloseOutlined style={{ fontSize: 14 }} />}
      className={`dynamic-view-sidebar ${className}`.trim()}
      rootStyle={style}
      styles={{
        header: {
          padding: '14px 20px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
        body: {
          padding: config.tabs && config.tabs.length > 0 ? '0 20px 20px' : '16px 20px 24px',
        },
        footer: {
          padding: '12px 20px',
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <Spin spinning={loading}>
        {/* Render Tabs if defined */}
        {config.tabs && config.tabs.length > 0 ? (
          <Tabs
            defaultActiveKey={config.tabs[0]?.key}
            items={config.tabs.map((tab) => ({
              key: tab.key,
              label: (
                <Space size={6}>
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 10,
                        fontSize: 11,
                        background: token.colorFillSecondary,
                        color: token.colorTextSecondary,
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </Space>
              ),
              children: (
                <div style={{ paddingTop: 12 }}>
                  {typeof tab.content === 'function'
                    ? tab.content(activeData)
                    : tab.content ||
                      (tab.sections && tab.sections.length > 0
                        ? renderSectionList(tab.sections)
                        : renderFieldList(tab.fields))}

                  {/* Tab-specific actions if any */}
                  {tab.actions && tab.actions.length > 0 && (
                    <div
                      style={{
                        marginTop: 20,
                        paddingTop: 14,
                        borderTop: `1px dashed ${token.colorBorderSecondary}`,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 8,
                      }}
                    >
                      {tab.actions.map((act) => (
                        <Button
                          key={act.key}
                          type={act.type || 'default'}
                          danger={act.danger}
                          icon={act.icon}
                          onClick={() => handleActionClick(act)}
                        >
                          {act.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        ) : config.sections && config.sections.length > 0 ? (
          renderSectionList(config.sections)
        ) : (
          renderFieldList(config.fields)
        )}
      </Spin>
    </Drawer>
  );
}
