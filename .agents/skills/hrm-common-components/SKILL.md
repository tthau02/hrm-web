---
name: hrm-common-components
description: >-
  Expert guide for creating pages and features in HRM Web using the core common components:
  CommonTable, FilterBar, DynamicViewSidebar, DynamicFormSidebar, PageHeader, and StatCard.
  Activate when implementing list pages, detail sidebars, creation/edit forms, or table features.
---

# HRM Common Components Skill

This skill guides AI agents in implementing HRM Web features using the project's standardized, reusable common component suite according to `DESIGN.md`.

---

## 1. Core Principles

1. **Zero Raw HTML Boilerplate**:
   - Do NOT write custom `<table>`, raw `<div>` lists, or ad-hoc table action menus in feature pages.
   - Use `CommonTable`, `FilterBar`, `DynamicViewSidebar`, and `DynamicFormSidebar`.
2. **Hairline-Only Depth (DESIGN.md)**:
   - Zero blurry drop shadows. Everything uses 1px hairline borders (`#e6e5e0` light / `#2d2d2d` dark).
   - Primary Accent: Cursor Orange (`#f54e00`).
   - Font: Inter for text, JetBrains Mono for numbers, codes, salaries, and dates.
3. **Responsive Drawers**:
   - Details & Forms are rendered inside 720px slide-out drawers, not tight modal popups.

---

## 2. Standard Feature Page Recipe

When creating any CRUD feature (e.g., Employees, Departments, Contracts, Attendance), follow this exact structure:

```tsx
import React, { useState, useMemo } from 'react';
import {
  PageHeader,
  StatCard,
  FilterBar,
  CommonTable,
  DynamicViewSidebar,
  DynamicFormSidebar,
  type FilterField,
  type CommonTableColumn,
  type DynamicViewConfig,
  type DynamicFormConfig,
} from '@/components/common';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export const FeatureListPage: React.FC = () => {
  // 1. State management
  const [selectedRecord, setSelectedRecord] = useState<Item | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Item | null>(null);

  // 2. Filter Configuration
  const filterFields: FilterField[] = useMemo(() => [
    { name: 'search', type: 'search', placeholder: 'Tìm kiếm...', width: 280 },
    { name: 'status', type: 'select', placeholder: 'Trạng thái', width: 180, options: [...] },
  ], []);

  // 3. Table Column Configuration
  const columns: CommonTableColumn<Item>[] = useMemo(() => [
    { title: 'Tên', key: 'name', renderUser: (r) => ({ name: r.name, email: r.email }) },
    { title: 'Trạng thái', key: 'status', dataIndex: 'status', renderStatus: true },
  ], []);

  // 4. View Sidebar Configuration
  const viewConfig: DynamicViewConfig<Item> = useMemo(() => ({
    title: 'Chi tiết bản ghi',
    width: 720,
    tabs: [...],
    actions: [...],
  }), []);

  // 5. Form Sidebar Configuration
  const formConfig: DynamicFormConfig = useMemo(() => ({
    title: 'Thêm mới bản ghi',
    editTitle: 'Cập nhật bản ghi',
    isEdit: !!editingRecord,
    width: 720,
    tabs: [...],
  }), [editingRecord]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="..." primaryAction={{ label: 'Thêm mới', icon: <PlusOutlined />, onClick: () => ... }} />
      <FilterBar fields={filterFields} onSearch={handleSearch} />
      <CommonTable<Item>
        rowKey="id"
        columns={columns}
        dataSource={data}
        actions={(record) => [
          { key: 'view', label: 'Xem chi tiết', icon: <EyeOutlined />, onClick: () => handleView(record) },
          { key: 'edit', label: 'Chỉnh sửa', icon: <EditOutlined />, onClick: () => handleEdit(record) },
          { key: 'delete', label: 'Xóa', icon: <DeleteOutlined />, danger: true, confirm: { ... } },
        ]}
      />
      <DynamicViewSidebar<Item> config={viewConfig} open={viewOpen} onClose={() => setViewOpen(false)} data={selectedRecord} />
      <DynamicFormSidebar config={formConfig} open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
    </div>
  );
};
```

---

## 3. Component Details & Quick Reference

### `CommonTable<T>`
- **STT Column**: Added automatically. Calculates global sequence number: `(page - 1) * pageSize + index + 1`. Frozen left.
- **Action Column**: Added automatically via `actions={(record) => [...]}`. Frozen right.
- **Built-in Renderers**:
  - `renderUser: (record) => ({ name, email, avatar })`
  - `renderTitleSubtitle: (record) => ({ title, subtitle })`
  - `renderStatus: true | (val) => ({ status, label })`
  - `renderCurrency: (val) => Number(val)`
  - `renderDate: (val) => string`
- **Text Truncation**: Set `maxTextWidth: 200` to automatically truncate long texts with an Ant Design Tooltip.

### `FilterBar`
- Field Types: `'search' | 'text' | 'select' | 'date' | 'dateRange'`
- Select with "All": Options array can include `{ label: 'Tất cả...', value: 'all' }`. FilterBar handles `all` selection smoothly without undefined errors.
- Always uniform 40px height with crisp hairline outline and Cursor Orange `:focus`.

### `DynamicViewSidebar<T>`
- Drawer `width: 720`.
- Tabs: `tabs: [{ key, label, sections: [{ title, columns: 2, fields: [...] }] }]`.
- Supported field types: `'text'`, `'number'`, `'currency'`, `'date'`, `'datetime'`, `'status'`, `'tag'`, `'user'`, `'link'`, `'custom'`.
- Supports Next/Previous record navigation:
  `navigationIds={ids}` `currentIndex={idx}` `totalCount={total}` `onNavigate={(id, idx) => ...}`.

### `DynamicFormSidebar`
- Drawer `width: 720`.
- Tabs & Grid: Groups fields in 2 columns (`span: 12`) or full width (`span: 24`).
- Input Types: `'text'`, `'textarea'`, `'number'`, `'currency'`, `'select'`, `'date'`, `'email'`, `'phone'`, `'switch'`.
- Footer: Action buttons "Hủy bỏ" & "Lưu thông tin" automatically centered.

---

## 4. Anti-Patterns to Avoid

❌ **DO NOT** create raw Ant Design `<Table>` instances with custom render functions that duplicate avatar, badge, or currency formatting.
❌ **DO NOT** use `Modal` for complex create/edit forms. Use `DynamicFormSidebar` for high-density editing.
❌ **DO NOT** add custom drop shadows (`box-shadow: 0 4px 12px rgba(...)`). Follow the hairline elevation from `DESIGN.md`.
❌ **DO NOT** place action buttons directly as text links in table rows. Let `CommonTable` render the circular dropdown button.
