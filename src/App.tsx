import React, { useEffect } from 'react';
import { ConfigProvider, theme as antdTheme, App as AntdApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store, useAppSelector } from '@/store';
import { AppRoutes } from '@/routes';

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ThemedApp: React.FC = () => {
  const { isDarkMode } = useAppSelector((state) => state.theme);

  // Sync page background color directly with Ant Design theme state
  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#141414' : '#f7f7f4';
    document.body.style.color = isDarkMode ? '#e5e7eb' : '#26251e';
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#f54e00', // Cursor Orange from DESIGN.md
          colorPrimaryHover: '#d04200',
          colorPrimaryActive: '#b33900',
          borderRadius: 8,
          fontFamily:
            "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorBgLayout: isDarkMode ? '#141414' : '#f7f7f4',
          colorBgContainer: isDarkMode ? '#1e1e1e' : '#ffffff',
          colorBorderSecondary: isDarkMode ? '#2d2d2d' : '#e6e5e0',
        },
        components: {
          Button: {
            controlHeight: 40,
            borderRadius: 8,
          },
          Input: {
            controlHeight: 40,
            borderRadius: 8,
          },
          Select: {
            controlHeight: 40,
            borderRadius: 8,
          },
          DatePicker: {
            controlHeight: 40,
            borderRadius: 8,
          },
          Card: {
            borderRadiusLG: 12,
          },
          Table: {
            borderRadius: 12,
          },
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemedApp />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
