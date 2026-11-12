import React, { useCallback } from 'react';
import { Modal } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from '@/locales';

export interface ConfirmDialogOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  /** Destructive action: red icon + red confirm button */
  danger?: boolean;
  /** Override the default icon (trash for danger, exclamation otherwise) */
  icon?: React.ReactNode;
  /** Override the confirm button icon (trash for danger, check otherwise) */
  okIcon?: React.ReactNode;
  /** Override the cancel button icon (default: close) */
  cancelIcon?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
}

/**
 * Themed, centered confirmation dialog.
 *
 * Uses `Modal.useModal()` so the dialog renders inside the React tree and inherits the
 * ConfigProvider theme (static `Modal.confirm` ignores it). Render `holder` once in your component.
 *
 * ```tsx
 * const [confirm, confirmHolder] = useConfirmDialog();
 * confirm({ title: 'Xóa hàng hóa', description: '...', danger: true, onConfirm: () => remove(id) });
 * return <>{confirmHolder}...</>;
 * ```
 */
export function useConfirmDialog() {
  const [modal, holder] = Modal.useModal();
  const { t } = useTranslation();

  const confirm = useCallback(
    (options: ConfirmDialogOptions) => {
      const { title, description, okText, cancelText, danger, icon, okIcon, cancelIcon, onConfirm } = options;
      return modal.confirm({
        className: 'wms-confirm',
        centered: true,
        width: 440,
        icon: null,
        maskClosable: true,
        title: (
          <div className="wms-confirm-head">
            <span className={`wms-confirm-icon${danger ? ' is-danger' : ''}`}>
              {icon ?? (danger ? <DeleteOutlined /> : <ExclamationCircleOutlined />)}
            </span>
            <span className="wms-confirm-title">{title}</span>
          </div>
        ),
        content: description ? <div className="wms-confirm-desc">{description}</div> : null,
        okText: okText || t.common.confirm,
        cancelText: cancelText || t.common.cancel,
        okButtonProps: { danger, icon: okIcon ?? (danger ? <DeleteOutlined /> : <CheckOutlined />) },
        cancelButtonProps: { icon: cancelIcon ?? <CloseOutlined /> },
        onOk: onConfirm,
      });
    },
    [modal, t]
  );

  return [confirm, holder] as const;
}
