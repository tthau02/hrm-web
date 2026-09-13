# HRM Web - AI Agent Guide & Component Reference

Tài liệu hướng dẫn dành cho AI Agents (Antigravity, Cursor, Copilot, Claude...) và lập trình viên khi phát triển các tính năng trên dự án **HRM Web**.

---

## 1. Tổng quan Dự án (Project Overview)

- **Ngành nghề/Mục đích**: Hệ thống quản lý nhân sự (HRM - Human Resource Management).
- **Tech Stack**:
  - **Core**: React 18 (TypeScript), Vite
  - **UI Library**: Ant Design v5 (AntD)
  - **State Management**: Redux Toolkit (`src/store/`)
  - **Server Cache / API**: TanStack Query (`@tanstack/react-query`) + Axios (`src/api/client.ts`)
  - **Icons**: `@ant-design/icons`
  - **Routing**: `react-router-dom` v6 (`src/routes/`)

---

## 2. Quy tắc Thiết kế (Design System & `DESIGN.md`)

Khi tạo mới hoặc sửa giao diện, **bắt buộc tuân thủ các quy tắc sau**:

1. **Không sử dụng Drop Shadow nhòe (No Blurry Shadows)**:
   - Toàn bộ card, table, drawer, filter bar dùng **Hairline 1px border**:
     - Light mode: `border: 1px solid #e6e5e0`
     - Dark mode: `border: 1px solid #2d2d2d`
2. **Màu sắc chủ đạo (Cursor Orange)**:
   - Primary CTA / Accent: `#f54e00` (Hover: `#d04200`, Active: `#b33900`)
   - Nền trang (Canvas): `#f7f7f4` (Light) / `#141414` (Dark)
   - Nền card/panel: `#ffffff` (Light) / `#1e1e1e` (Dark)
   - Màu chữ: Display/Heading `#26251e`, Body `#5a5852`, Muted `#807d72`
3. **Typography**:
   - Font văn bản: `'Inter', system-ui, sans-serif`
   - Mã nhân viên, số tiền, ngày tháng, STT: `font-family: var(--font-mono)` (`'JetBrains Mono'`)
4. **Không viết code HTML/CSS thô lặp lại**:
   - Mọi trang danh sách (ListPage), xem chi tiết (View), biểu mẫu (Form) **phải sử dụng bộ Common Components** bên dưới.

---

## 3. Thư mục & Cấu trúc Dự án

```text
hrm-web/
├── .agents/
│   └── skills/
│       └── hrm-common-components/
│           └── SKILL.md                 # Skill hướng dẫn AI viết common component
├── src/
│   ├── api/                             # Axios client, endpoints, mockData
│   ├── components/
│   │   ├── common/                      # BỘ COMMON COMPONENTS CHỦ ĐẠO
│   │   │   ├── CommonTable.tsx          # Bảng dữ liệu thông minh + action dropdown
│   │   │   ├── FilterBar.tsx            # Thanh lọc dữ liệu config-driven
│   │   │   ├── PageHeader.tsx           # Tiêu đề trang + breadcrumbs + CTAs
│   │   │   ├── StatCard.tsx             # Thẻ chỉ số KPI / thống kê
│   │   │   ├── StatusBadge.tsx          # Huy hiệu trạng thái (Active, Probation...)
│   │   │   ├── DynamicViewSidebar/      # Sidebar xem chi tiết kèm phân trang record
│   │   │   ├── DynamicFormSidebar/      # Sidebar thêm mới / chỉnh sửa dữ liệu
│   │   │   └── Notification.tsx         # Thông báo bottomRight thay thế window.alert
│   ├── features/                        # Các module tính năng (employees, departments...)
│   ├── hooks/                           # Custom hooks (useHrmQuery...)
│   ├── layouts/                         # MainLayout, Sidebar, Header
│   ├── routes/                          # Định tuyến ứng dụng
│   ├── store/                           # Redux slices (theme, auth...)
│   └── styles/
│       └── common.css                   # CSS tokens chuẩn DESIGN.md
├── DESIGN.md                            # Nguyên tắc thiết kế Cursor Hairline
└── AGENTS.md                            # Tài liệu này
```

---

## 4. Hướng dẫn sử dụng Bộ Common Components

Tất cả component được export trực tiếp từ `@/components/common`:
```tsx
import {
  CommonTable,
  FilterBar,
  PageHeader,
  StatCard,
  StatusBadge,
  DynamicViewSidebar,
  DynamicFormSidebar,
} from '@/components/common';
```

---

### 4.1 `CommonTable` (Bảng dữ liệu thông minh)

Bảng đã đóng gói sẵn:
- Cột **STT** tự động tính theo phân trang và **cố định bên trái (freeze left)**.
- Cột **Thao tác** dạng nút tròn 3 chấm prominent và **cố định bên phải (freeze right)**.
- Tự động cắt ngắn text kèm `Tooltip` nếu quá dài.
- Tích hợp sẵn helper renderers: `renderUser`, `renderStatus`, `renderCurrency`, `renderDate`, `renderTitleSubtitle`.

#### Cách dùng:
```tsx
import { CommonTable, type CommonTableColumn } from '@/components/common';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const columns: CommonTableColumn<Employee>[] = [
  {
    title: 'Nhân viên',
    key: 'user',
    renderUser: (record) => ({
      name: record.fullName,
      email: record.email,
      avatar: record.avatar,
    }),
  },
  {
    title: 'Phòng ban / Chức vụ',
    key: 'dept',
    renderTitleSubtitle: (record) => ({
      title: record.departmentName,
      subtitle: record.position,
    }),
  },
  {
    title: 'Lương cơ bản',
    dataIndex: 'salary',
    key: 'salary',
    renderCurrency: (val) => Number(val),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    renderStatus: true, // Tự động map StatusBadge theo status
  },
];

<CommonTable<Employee>
  rowKey="id"
  columns={columns}
  dataSource={employees}
  loading={isLoading}
  pagination={{
    current: page,
    pageSize: pageSize,
    total: totalCount,
    onChange: (p, s) => { setPage(p); setPageSize(s); },
  }}
  actions={(record) => [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: <EyeOutlined />,
      onClick: () => handleView(record),
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa thông tin',
      icon: <EditOutlined />,
      onClick: () => handleEdit(record),
    },
    {
      key: 'delete',
      label: 'Xóa nhân viên',
      icon: <DeleteOutlined />,
      danger: true,
      confirm: {
        title: 'Xóa nhân viên',
        description: `Bạn có chắc chắn muốn xóa ${record.fullName}?`,
        okText: 'Xóa',
        cancelText: 'Hủy',
        onConfirm: () => handleDelete(record.id),
      },
    },
  ]}
/>
```

---

### 4.2 `FilterBar` (Thanh lọc dữ liệu cấu hình)

Thanh lọc tự căn đều chiều cao (40px), không lệch hàng, tự xử lý giá trị `'all'` cho Select, hỗ trợ Enter để tìm kiếm.

#### Cách dùng:
```tsx
import { FilterBar, type FilterField } from '@/components/common';

const filterFields: FilterField[] = [
  {
    name: 'search',
    type: 'search',
    placeholder: 'Tìm theo tên, mã NV, email...',
    width: 280,
  },
  {
    name: 'departmentId',
    type: 'select',
    placeholder: 'Tất cả phòng ban',
    options: departmentOptions, // FilterBar tự động thêm option 'Tất cả' theo placeholder
    width: 200,
  },
  {
    name: 'status',
    type: 'select',
    placeholder: 'Tất cả trạng thái',
    options: [
      { label: 'Chính thức', value: 'active' },
      { label: 'Thử việc', value: 'probation' },
      { label: 'Nghỉ phép', value: 'on_leave' },
      { label: 'Đã thôi việc', value: 'resigned' },
    ],
    width: 180,
  },
  {
    name: 'dateRange',
    type: 'dateRange',
    placeholder: ['Từ ngày', 'Đến ngày'],
    width: 260,
  },
];

<FilterBar
  fields={filterFields}
  onSearch={(values) => handleFilter(values)}
  onReset={() => handleReset()}
/>
```

---

### 4.3 `DynamicViewSidebar` (Xem chi tiết bản ghi dạng Drawer)

Xem thông tin chi tiết mượt mà với:
- Nút điều hướng record trước/sau (`< Trước`, `Sau >`, số thứ tự `1 / 50`).
- Chia tab hoặc chia section (`DynamicViewSection[]`).
- Hỗ trợ đầy đủ kiểu dữ liệu: `text`, `currency`, `date`, `status`, `user`, `tag`, `custom`.
- Footer gắn các nút hành động (Chỉnh sửa, Xóa).

#### Cách dùng:
```tsx
import { DynamicViewSidebar, type DynamicViewConfig } from '@/components/common';

const viewConfig: DynamicViewConfig<Employee> = {
  title: 'Chi tiết nhân viên',
  subtitle: (emp) => `${emp.employeeCode} • ${emp.departmentName}`,
  width: 720,
  tabs: [
    {
      key: 'general',
      label: 'Thông tin chung',
      sections: [
        {
          title: 'Hồ sơ cá nhân',
          columns: 2,
          fields: [
            { label: 'Mã nhân viên', key: 'employeeCode' },
            { label: 'Họ và tên', key: 'fullName' },
            { label: 'Email', key: 'email' },
            { label: 'Số điện thoại', key: 'phone' },
            { label: 'Trạng thái', key: 'status', type: 'status' },
          ],
        },
        {
          title: 'Công việc & Lương',
          columns: 2,
          fields: [
            { label: 'Phòng ban', key: 'departmentName' },
            { label: 'Chức danh', key: 'position' },
            { label: 'Lương cơ bản', key: 'salary', type: 'currency' },
            { label: 'Ngày vào làm', key: 'joinDate', type: 'date' },
          ],
        },
      ],
    },
  ],
  actions: [
    {
      key: 'edit',
      label: 'Chỉnh sửa thông tin',
      icon: <EditOutlined />,
      type: 'primary',
      onClick: (data) => handleOpenEdit(data),
    },
  ],
};

<DynamicViewSidebar<Employee>
  config={viewConfig}
  open={isOpen}
  onClose={() => setIsOpen(false)}
  data={selectedEmployee}
  navigationIds={employeeList.map((e) => e.id)}
  currentIndex={employeeList.findIndex((e) => e.id === selectedEmployee?.id)}
  totalCount={employeeList.length}
  onNavigate={(_id, index) => setSelectedEmployee(employeeList[index])}
/>
```

---

### 4.4 `DynamicFormSidebar` (Biểu mẫu Thêm/Sửa dạng Drawer)

Thay thế các Modal popup chật chội bằng Sidebar Drawer hiện đại:
- Chia nhóm field theo tab hoặc lưới 2 cột.
- Đầy đủ input: `text`, `textarea`, `number`, `currency`, `select`, `date`, `switch`.
- Tự động nạp `initialValues` khi sửa, validate required fields.
- 2 nút chân trang căn giữa ("Hủy bỏ" & "Lưu thông tin").

#### Cách dùng:
```tsx
import { DynamicFormSidebar, type DynamicFormConfig } from '@/components/common';

const formConfig: DynamicFormConfig = {
  title: 'Thêm mới nhân viên',
  editTitle: 'Cập nhật thông tin nhân viên',
  isEdit: Boolean(editingRecord),
  width: 720,
  tabs: [
    {
      key: 'basic',
      label: 'Thông tin cơ bản',
      fields: [
        { name: 'fullName', label: 'Họ và tên', type: 'text', required: true, span: 12 },
        { name: 'email', label: 'Email', type: 'email', required: true, span: 12 },
        { name: 'phone', label: 'Số điện thoại', type: 'phone', span: 12 },
        {
          name: 'departmentId',
          label: 'Phòng ban',
          type: 'select',
          required: true,
          options: departmentOptions,
          span: 12,
        },
        {
          name: 'salary',
          label: 'Lương cơ bản',
          type: 'currency',
          span: 12,
        },
        {
          name: 'joinDate',
          label: 'Ngày vào làm',
          type: 'date',
          required: true,
          span: 12,
        },
      ],
    },
  ],
};

<DynamicFormSidebar
  config={formConfig}
  open={formOpen}
  onClose={() => setFormOpen(false)}
  initialValues={editingRecord}
  onSubmit={handleSubmit}
  saving={isSubmitting}
/>
```

---

### 4.5 `PageHeader` & `StatCard`

```tsx
import { PageHeader, StatCard } from '@/components/common';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';

// Header trang:
<PageHeader
  title="Quản lý Nhân sự"
  subtitle="Danh sách và thông tin hồ sơ nhân sự toàn công ty"
  breadcrumbs={[
    { label: 'Tổng quan', path: '/dashboard' },
    { label: 'Nhân viên' },
  ]}
  primaryAction={{
    label: 'Thêm nhân viên',
    icon: <PlusOutlined />,
    onClick: () => setFormOpen(true),
  }}
/>

// KPI Stat Cards:
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
  <StatCard
    title="Tổng nhân sự"
    value={142}
    trend={{ value: 5.2, isPositive: true }}
    icon={<UserOutlined />}
  />
</div>
```

---

### 4.6 `notify` & `useNotification` (Notification bottomRight kèm `showProgress` & `pauseOnHover`)

Thay thế các `window.alert(...)` và toast cũ bằng thông báo hiện đại của Ant Design tại vị trí góc dưới bên phải (`bottomRight`), tích hợp thanh đếm ngược tiến trình (`showProgress: true`) và tự động tạm dừng khi rê chuột (`pauseOnHover: true`), tuân thủ chuẩn hairline border và dark/light mode:

```tsx
import { notify, useNotification } from '@/components/common';

// Cách 1: Dùng trực tiếp qua helper `notify` (nhanh gọn, không cần hook & contextHolder)
notify.success('Xuất file Excel thành công!');
notify.error('Không thể kết nối đến máy chủ');
notify.info('Tính năng đang được phát triển');
notify.warning('Vui lòng kiểm tra lại thông tin');

// Dạng kèm tiêu đề + mô tả chi tiết:
notify.success('Thành công', 'Dữ liệu nhân viên đã được cập nhật.');

// Dạng truyền object tùy biến đầy đủ (hỗ trợ title, description, showProgress, pauseOnHover):
notify.success({
  title: 'Xuất Excel thành công',
  description: 'Dữ liệu danh sách nhân viên đã được trích xuất thành tệp Excel.',
  showProgress: true,
  pauseOnHover: true,
  duration: 4,
});

// Cách 2: Dùng hook nội bộ `useNotification` nếu cần quản lý contextHolder độc lập
const [api, contextHolder] = useNotification();
api.open({
  title: 'Notification Title',
  description: 'Nội dung thông báo...',
  showProgress: true,
  pauseOnHover: true,
});
```

---

## 5. Checklist khi AI Agent code tính năng mới

- [ ] Đã đọc `DESIGN.md` để áp dụng màu Cursor Orange `#f54e00`, viền 1px hairline, không dùng drop shadow nhòe.
- [ ] Bảng dữ liệu dùng `CommonTable`, không viết lại `Table` thủ công.
- [ ] Bộ lọc dùng `FilterBar`.
- [ ] Xem chi tiết dùng `DynamicViewSidebar` thay vì modal thông thường.
- [ ] Thêm / Sửa dùng `DynamicFormSidebar`.
- [ ] Thông báo phản hồi dùng `notify` (`bottomRight`), **tuyệt đối không dùng `window.alert`**.
- [ ] Kiểm tra cả Light Mode và Dark Mode sau khi hoàn thành.
- [ ] Chạy `npm run lint` và `npm run build` để kiểm tra TypeScript và cú pháp.
