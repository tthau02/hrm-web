import React, { useEffect } from 'react';
import { notification } from 'antd';
import type { ArgsProps, NotificationInstance } from 'antd/es/notification/interface';

// Configure static fallback instance with bottomRight placement and progress bar
notification.config({
  placement: 'bottomRight',
  duration: 4,
  bottom: 24,
  showProgress: true,
  pauseOnHover: true,
});

let activeNotificationApi: NotificationInstance | null = null;

/**
 * Re-export useNotification from Ant Design for local hook usage
 * Example:
 * const [api, contextHolder] = useNotification();
 */
export const useNotification = notification.useNotification;

/**
 * NotificationBridge component
 * Placed inside Ant Design <App> in App.tsx.
 * Uses notification.useNotification({ placement: 'bottomRight', showProgress: true, pauseOnHover: true })
 * and renders {contextHolder} while binding api globally to notify utility.
 */
export const NotificationBridge: React.FC = () => {
  const [api, contextHolder] = notification.useNotification({
    placement: 'bottomRight',
    showProgress: true,
    pauseOnHover: true,
  });

  useEffect(() => {
    activeNotificationApi = api;
    return () => {
      activeNotificationApi = null;
    };
  }, [api]);

  return <>{contextHolder}</>;
};

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface NotifyOptions extends Omit<ArgsProps, 'message' | 'title'> {
  title?: React.ReactNode;
  message?: React.ReactNode;
  description?: React.ReactNode;
  showProgress?: boolean;
  pauseOnHover?: boolean;
}

const getHandler = (type?: NotificationType) => {
  const inst = activeNotificationApi || notification;
  if (!type) return inst.open.bind(inst);
  switch (type) {
    case 'success':
      return inst.success.bind(inst);
    case 'error':
      return inst.error.bind(inst);
    case 'warning':
      return inst.warning.bind(inst);
    case 'info':
    default:
      return inst.info.bind(inst);
  }
};

const normalizeArgs = (
  titleOrOptions: React.ReactNode | NotifyOptions,
  description?: React.ReactNode
): ArgsProps => {
  if (
    typeof titleOrOptions === 'object' &&
    titleOrOptions !== null &&
    !React.isValidElement(titleOrOptions) &&
    ('title' in (titleOrOptions as object) || 'message' in (titleOrOptions as object))
  ) {
    const opts = titleOrOptions as NotifyOptions;
    const resolvedTitle = opts.title ?? opts.message;
    return {
      placement: 'bottomRight',
      showProgress: true,
      pauseOnHover: true,
      ...opts,
      title: resolvedTitle,
      message: resolvedTitle,
    };
  }

  return {
    title: titleOrOptions as React.ReactNode,
    message: titleOrOptions as React.ReactNode,
    description,
    placement: 'bottomRight',
    showProgress: true,
    pauseOnHover: true,
  };
};

/**
 * Common Notification Utility
 * Ant Design bottomRight notification with showProgress and pauseOnHover enabled.
 *
 * Usage examples:
 * - notify.success('Thành công', 'Dữ liệu đã được lưu')
 * - notify.error('Có lỗi xảy ra', 'Vui lòng thử lại sau')
 * - notify.info({ title: 'Thông báo', description: 'Cập nhật hệ thống', showProgress: true, pauseOnHover: true })
 * - notify('Thao tác thành công', 'success')
 */
export interface NotifyFunction {
  (
    titleOrOptions: React.ReactNode | NotifyOptions,
    type?: NotificationType,
    description?: React.ReactNode
  ): void;
  success: (titleOrOptions: React.ReactNode | NotifyOptions, description?: React.ReactNode) => void;
  error: (titleOrOptions: React.ReactNode | NotifyOptions, description?: React.ReactNode) => void;
  info: (titleOrOptions: React.ReactNode | NotifyOptions, description?: React.ReactNode) => void;
  warning: (titleOrOptions: React.ReactNode | NotifyOptions, description?: React.ReactNode) => void;
  open: (args: ArgsProps) => void;
  destroy: (key?: React.Key) => void;
  useNotification: typeof notification.useNotification;
}

export const notify: NotifyFunction = ((
  titleOrOptions: React.ReactNode | NotifyOptions,
  type: NotificationType = 'info',
  description?: React.ReactNode
) => {
  const handler = getHandler(type);
  handler(normalizeArgs(titleOrOptions, description));
}) as NotifyFunction;

notify.success = (titleOrOptions, description) => {
  getHandler('success')(normalizeArgs(titleOrOptions, description));
};

notify.error = (titleOrOptions, description) => {
  getHandler('error')(normalizeArgs(titleOrOptions, description));
};

notify.info = (titleOrOptions, description) => {
  getHandler('info')(normalizeArgs(titleOrOptions, description));
};

notify.warning = (titleOrOptions, description) => {
  getHandler('warning')(normalizeArgs(titleOrOptions, description));
};

notify.open = (args: ArgsProps) => {
  const inst = activeNotificationApi || notification;
  inst.open({
    placement: 'bottomRight',
    showProgress: true,
    pauseOnHover: true,
    ...args,
  });
};

notify.destroy = (key?: React.Key) => {
  const inst = activeNotificationApi || notification;
  inst.destroy(key);
};

notify.useNotification = notification.useNotification;

export default notify;
