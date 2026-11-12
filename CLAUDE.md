# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**SASCO Duty-Free WMS (POC)** — warehouse management for duty-free goods. The repo started life as an HRM app (hence the `hrm-web` folder and `hrm-common-components` skill name) and was rebranded; all HRM features were removed. Only one sample CRUD feature exists, **Hàng hóa miễn thuế** (`src/features/products/`), whose purpose is to validate the UI/theme before real features are built.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build (type-check + bundle)
npm run lint      # eslint .
npm run preview   # serve the production build
```

There is no test runner. `npm run lint` currently reports pre-existing `react-refresh/only-export-components` and `react-hooks/set-state-in-effect` errors inside `src/components/common`; `npm run build` is clean.

## Stack

React 19 + TypeScript + Vite, Ant Design 6, Redux Toolkit, TanStack Query, Axios, react-router-dom v7, ECharts. Path alias `@/` → `src/`. (AGENTS.md may still cite older versions — `package.json` is authoritative.)

## Architecture

- **Design system**: Cobalt `#0064e0` primary on a cool-grey canvas `#e6ebf1`, white cards/sidebar, Gold `#ccad6a` only for the logo mark. Full table at the top of [DESIGN.md](DESIGN.md); code source of truth is `src/theme/tokens.ts` → `antdTheme.ts`. Many hex values are also hardcoded in `src/styles/common.css`, so changing the palette means updating both. Rules: hairline 1px borders, no blurry shadows, no saturated colour blocks (the sidebar is light with a tinted selected item), Inter + JetBrains Mono (codes/money/dates). Dark mode uses a lighter primary (`primaryOnDark`).
- **Common components** (`src/components/common`, imported from `@/components/common`): list pages must use `CommonTable`, `FilterBar`, `PageHeader`, `DynamicViewSidebar`, `DynamicFormSidebar`, `ChangeHistory`, and `notify` (never `window.alert`). `useCrudModal<T>` (`src/hooks`) manages view/edit drawer state. API usage is documented in [AGENTS.md](AGENTS.md) (its examples use an `Employee` entity for illustration only). Copy `src/features/products/` (`ProductListPage` + `ProductView` + `ProductCreateOrUpdate`) when adding a new CRUD module.
- **Data layer**: `src/api/endpoints.ts` (typed calls) → `src/hooks/useProductQuery.ts` (TanStack Query hooks, `QUERY_KEYS`, mutations that invalidate `['products']` and fire `notify`). Follow this pair for new resources.
- **Built-in mock backend**: `src/api/client.ts` installs a request interceptor (active unless `VITE_USE_MOCK=false`) that matches URL/method, rejects with a `{__isMockResponse}` object, and a response interceptor converts it back into a resolved response. Data lives in `src/api/mockData.ts`, mutated in memory. New endpoints need a mock branch there while mocking is on. Real API base: `VITE_API_BASE_URL` (default `/api/v1`). Auth token/user are in `localStorage` (`sasco_token`, `sasco_user`; also `sasco_dark_mode`, `sasco_locale`). `authSlice` starts authenticated as the demo admin.
- **State**: Redux store has only `auth`, `theme`, `locale`; use typed `useAppDispatch`/`useAppSelector`. Server data belongs in TanStack Query.
- **Routing & RBAC**: `src/routes/index.tsx` wraps routes in `ProtectedRoute` with `allowedRoles`; roles are `admin | warehouse_manager | staff`. Per-route roles live in `APP_ROUTE_ROLES` in `src/routes/appNavigation.tsx`, which also defines the sidebar tree (filtered by role). Adding a page = route + `APP_ROUTE_ROLES` entry + nav item + `navigation` label key in both locales; the sidebar group open-state is hardcoded per path prefix in `MainLayout.tsx`.
- **i18n**: custom, no library. `src/locales/vi.ts` defines `TranslationSchema`; `en.ts` must match. Use `useTranslation()` in components, `getCurrentTranslations()` outside React. Default `vi`. Feature pages currently hardcode Vietnamese strings.
- **Theming**: light/dark via `themeSlice` (`data-theme="dark"` on `<html>`); CSS tokens/overrides in `src/styles/common.css`, responsive rules in `src/styles/responsive.css`. CSS class prefix is `wms-`. Verify both modes after UI changes.
