import React from 'react';
import { Badge, Button, Empty, List, Popover, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useTranslation } from '@/locales';

export interface HeaderNotificationItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  read?: boolean;
}

export interface HeaderNotificationProps {
  notifications?: HeaderNotificationItem[];
  onNotificationClick?: (notification: HeaderNotificationItem) => void;
}

export const HeaderNotification: React.FC<HeaderNotificationProps> = ({
  notifications = [],
  onNotificationClick,
}) => {
  const { t } = useTranslation();
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const content = (
    <div className="header-notification-panel">
      {notifications.length > 0 ? (
        <List
          dataSource={notifications}
          renderItem={(notification) => (
            <List.Item
              key={notification.id}
              className={`header-notification-item ${notification.read ? '' : 'unread'} ${onNotificationClick ? 'is-clickable' : ''}`}
              onClick={onNotificationClick ? () => onNotificationClick(notification) : undefined}
            >
              <div className="header-notification-copy">
                <Typography.Text strong={!notification.read}>
                  {notification.title}
                </Typography.Text>
                {notification.description && (
                  <Typography.Text type="secondary">{notification.description}</Typography.Text>
                )}
                {notification.time && (
                  <Typography.Text type="secondary" className="header-notification-time">
                    {notification.time}
                  </Typography.Text>
                )}
              </div>
              {!notification.read && <span className="header-notification-unread-dot" />}
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t.header.noNotifications}
          className="header-notification-empty"
        />
      )}
    </div>
  );

  return (
    <Popover
      title={t.header.notifications}
      content={content}
      placement="bottomRight"
      trigger="click"
      classNames={{ root: 'header-notification-popover' }}
    >
      <span className="header-notification-trigger">
        <Badge count={unreadCount} size="small" className="header-notification-badge">
          <Button
            className="header-tool-btn"
            aria-label={t.header.notifications}
            title={t.header.notifications}
            icon={<BellOutlined />}
          />
        </Badge>
      </span>
    </Popover>
  );
};

export default HeaderNotification;
