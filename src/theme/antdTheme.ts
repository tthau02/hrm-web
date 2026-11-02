import { theme as antdTheme, type ThemeConfig } from 'antd';
import { colors, radius, typography } from './tokens';

/**
 * Centralized Ant Design theme configuration mapping directly to DESIGN.md
 */
export function getAntdThemeConfig(isDarkMode: boolean): ThemeConfig {
  return {
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: colors.brand.primary,
      colorPrimaryHover: colors.brand.primaryHover,
      colorPrimaryActive: colors.brand.primaryActive,
      borderRadius: radius.md,
      fontFamily: typography.fontSans,
      colorBgLayout: isDarkMode ? colors.canvas.dark : colors.canvas.light,
      colorBgContainer: isDarkMode ? colors.surface.cardDark : colors.surface.cardLight,
      colorBorderSecondary: isDarkMode ? colors.hairline.dark : colors.hairline.light,
      colorBorder: isDarkMode ? colors.hairline.dark : colors.hairline.light,
      colorTextHeading: isDarkMode ? colors.text.inkDark : colors.text.inkLight,
      colorText: isDarkMode ? colors.text.bodyDark : colors.text.bodyLight,
      colorTextSecondary: isDarkMode ? colors.text.mutedDark : colors.text.mutedLight,
      colorSuccess: colors.semantic.success,
      colorError: colors.semantic.error,
      colorWarning: colors.semantic.warning,
      colorInfo: colors.semantic.info,
      // Motion tokens
      motionDurationFast: '0.15s',
      motionDurationMid: '0.22s',
      motionDurationSlow: '0.30s',
      motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      // Hairline depth: zero blurry shadows
      boxShadow: 'none',
      boxShadowSecondary: 'none',
      boxShadowTertiary: 'none',
    },
    components: {
      Button: {
        controlHeight: 40,
        borderRadius: radius.md,
        fontWeight: 600,
        primaryShadow: 'none',
        defaultShadow: 'none',
        dangerShadow: 'none',
      },
      Input: {
        controlHeight: 40,
        borderRadius: radius.md,
        colorBorder: isDarkMode ? colors.hairline.dark : colors.hairline.light,
      },
      InputNumber: {
        controlHeight: 40,
        borderRadius: radius.md,
      },
      Select: {
        controlHeight: 40,
        borderRadius: radius.md,
      },
      DatePicker: {
        controlHeight: 40,
        borderRadius: radius.md,
      },
      Card: {
        borderRadiusLG: radius.lg,
        colorBorderSecondary: isDarkMode ? colors.hairline.dark : colors.hairline.light,
        boxShadow: 'none',
      },
      Table: {
        borderRadius: radius.lg,
        headerBg: isDarkMode ? '#171717' : colors.canvas.softLight,
        headerColor: isDarkMode ? colors.text.inkDark : colors.text.inkLight,
        borderColor: isDarkMode ? colors.hairline.dark : colors.hairline.light,
      },
      Menu: {
        colorBgContainer: 'transparent',
        subMenuItemBg: 'transparent',
        itemBorderRadius: radius.md,
        itemHeight: 40,
        itemSelectedBg: isDarkMode ? 'rgba(245, 78, 0, 0.15)' : 'rgba(245, 78, 0, 0.08)',
        itemSelectedColor: colors.brand.primary,
      },
      Drawer: {
        colorBgElevated: isDarkMode ? colors.surface.cardDark : colors.surface.cardLight,
      },
      Modal: {
        borderRadiusLG: radius.lg,
        colorBgElevated: isDarkMode ? colors.surface.cardDark : colors.surface.cardLight,
      },
    },
  };
}
