import React, { useEffect } from 'react';
import { ConfigProvider, theme as antdTheme, App as AntdApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store, useAppSelector } from '@/store';
import { AppRoutes } from '@/routes';
import { NotificationBridge } from '@/components/common';
import { useTranslation } from '@/locales';

type RuntimeErrorState = { error: Error | null };

const AppErrorFallback: React.FC<{ error: Error; onRetry: () => void }> = ({ error, onRetry }) => {
  const { t } = useTranslation();

  return (
    <main className="app-error-screen" role="alert">
      <section className="app-error-panel">
        <h1>{t.errors.title}</h1>
        <p>{error.message || t.errors.unknown}</p>
        <details>
          <summary>{t.errors.details}</summary>
          <pre>{error.stack || error.message}</pre>
        </details>
        <div className="app-error-actions">
          <button type="button" onClick={onRetry}>{t.errors.retry}</button>
          <button type="button" onClick={() => window.location.reload()}>{t.errors.reload}</button>
        </div>
      </section>
    </main>
  );
};

class RuntimeErrorBoundary extends React.Component<React.PropsWithChildren, RuntimeErrorState> {
  state: RuntimeErrorState = { error: null };

  static getDerivedStateFromError(error: Error): RuntimeErrorState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled application render error:', error, info.componentStack);
  }

  componentDidMount() {
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  private handleWindowError = (event: ErrorEvent) => {
    this.setState({ error: event.error instanceof Error ? event.error : new Error(event.message) });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    this.setState({
      error: reason instanceof Error ? reason : new Error(String(reason ?? 'Unhandled promise rejection')),
    });
  };

  private handleRetry = () => this.setState({ error: null });

  render() {
    return this.state.error
      ? <AppErrorFallback error={this.state.error} onRetry={this.handleRetry} />
      : this.props.children;
  }
}

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
  const currentLocale = useAppSelector((state) => state.locale.currentLocale);

  // Sync page background color directly with Ant Design theme state
  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#141414' : '#f7f7f4';
    document.body.style.color = isDarkMode ? '#e5e7eb' : '#26251e';
    try {
      localStorage.setItem('hrm_dark_mode', String(isDarkMode));
    } catch {
      // Continue without persistence when browser storage is unavailable.
    }
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  return (
    <ConfigProvider
      locale={currentLocale === 'en' ? enUS : viVN}
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#f54e00', // Cursor Orange from DESIGN.md
          colorPrimaryHover: '#d04200',
          colorPrimaryActive: '#b33900',
          motionDurationFast: '0.18s',
          motionDurationMid: '0.26s',
          motionDurationSlow: '0.34s',
          motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
          motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
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
          InputNumber: {
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
          Menu: {
            colorBgContainer: 'transparent',
            subMenuItemBg: 'transparent',
            itemBorderRadius: 8,
            itemHeight: 40,
          },
        },
      }}
    >
      <AntdApp>
        <NotificationBridge />
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
      <RuntimeErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemedApp />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </RuntimeErrorBoundary>
    </Provider>
  );
};

export default App;
