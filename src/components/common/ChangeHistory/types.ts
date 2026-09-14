import React from 'react';

export type ChangeHistoryValueType =
  | 'text'
  | 'date'
  | 'datetime'
  | 'money'
  | 'status'
  | 'image'
  | 'badge'
  | 'custom';

export interface ChangeHistoryDetail {
  /** Tên trường / thuộc tính thay đổi (ví dụ: 'Số điện thoại', 'Phòng ban', 'Mức lương') */
  propertyName: string;
  /** Giá trị cũ trước khi thay đổi */
  oldValue?: any;
  /** Giá trị mới sau khi thay đổi */
  newValue?: any;
  /** Kiểu dữ liệu để định dạng hiển thị ('text' | 'date' | 'datetime' | 'money' | 'status' | 'image' | 'custom') */
  type?: ChangeHistoryValueType;
  /** CSS class tùy biến */
  oldValueStyleClass?: string;
  newValueStyleClass?: string;
  /** Format ngày tháng nếu là type date (mặc định: DD/MM/YYYY HH:mm:ss) */
  format?: string;
  /** Hàm render tùy biến cho giá trị */
  customRender?: (value: any, isNew: boolean, record: ChangeHistoryDetail) => React.ReactNode;
}

export interface ChangeHistoryItem {
  id?: string | number;
  /** Thời gian thay đổi (Date string, timestamp hoặc Date) */
  changeTime: string | number | Date;
  /** Tên người thực hiện thay đổi */
  userName?: string;
  /** Avatar người thực hiện */
  userAvatar?: string;
  /** Mã nhân viên / email */
  userCode?: string;
  /** Nguồn thay đổi (ví dụ: 'Web Portal', 'Mobile App', 'Hệ thống tự động') */
  sourceName?: string;
  /** Icon cho nguồn thay đổi */
  sourceIcon?: React.ReactNode;
  /** Tiêu đề thao tác (ví dụ: 'Cập nhật hồ sơ nhân sự') */
  actionTitle?: string;
  /** Mảng các trường thông tin thay đổi */
  changeDetails: ChangeHistoryDetail[];
}

export interface ChangeHistoryProps {
  /** Danh sách lịch sử thay đổi */
  data?: ChangeHistoryItem[];
  /** Alias tương thích hoàn toàn với change-history Angular: listHistoryChanges */
  listHistoryChanges?: ChangeHistoryItem[];
  /** Trạng thái đang tải dữ liệu */
  loading?: boolean;
  /** Tiêu đề khối lịch sử */
  title?: React.ReactNode;
  /** Chế độ hiển thị: 'card' (dạng bảng thẻ so sánh) hoặc 'timeline' (dạng dòng thời gian AntD) */
  mode?: 'card' | 'timeline';
  /** Giới hạn chiều cao và cuộn bên trong */
  maxHeight?: number | string;
  /** Hiển thị ô tìm kiếm nhanh trong lịch sử */
  searchable?: boolean;
  /** Placeholder cho ô tìm kiếm */
  searchPlaceholder?: string;
  /** Nội dung khi chưa có lịch sử */
  emptyText?: string;
  /** Hiển thị viền card ngoài */
  bordered?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
