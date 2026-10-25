import { vi, type TranslationSchema } from './vi';
import { en } from './en';
import { useAppSelector, useAppDispatch } from '@/store';
import { setLocale, toggleLocale, type SupportedLocale } from '@/store/slices/localeSlice';

export { vi, en };
export type { TranslationSchema, SupportedLocale };

export const translations: Record<SupportedLocale, TranslationSchema> = {
  vi,
  en,
};

/**
 * Format string template containing {param} with corresponding values
 * e.g. formatMessage("Total {count} records", { count: 10 }) => "Total 10 records"
 */
export function formatMessage(template: string, params?: Record<string, any>): string {
  if (!params) return template;
  return template.replace(/{(\w+)}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

/**
 * Global static helper to read current locale from localStorage
 */
export function getLocale(): SupportedLocale {
  const saved = localStorage.getItem('hrm_locale');
  return saved === 'en' ? 'en' : 'vi';
}

/**
 * Global static helper to get current translation object outside React components
 */
export function getCurrentTranslations(): TranslationSchema {
  return translations[getLocale()];
}

/**
 * Custom React hook for accessing current translation dictionary, locale, and switcher
 */
export function useTranslation() {
  const dispatch = useAppDispatch();
  const currentLocale = useAppSelector((state) => state.locale?.currentLocale || 'vi');
  const t = translations[currentLocale] || vi;

  const changeLocale = (locale: SupportedLocale) => {
    dispatch(setLocale(locale));
  };

  const switchLocale = () => {
    dispatch(toggleLocale());
  };

  return {
    t,
    locale: currentLocale,
    setLocale: changeLocale,
    toggleLocale: switchLocale,
    formatMessage,
  };
}
