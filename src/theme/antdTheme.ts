import { theme as antdTheme, type ThemeConfig } from 'antd';
import { colors, radius, sizes, typography } from './tokens';

/**
 * Centralized Ant Design theme configuration mapping directly to DESIGN.md (SASCO palette)
 */
export function getAntdThemeConfig(isDarkMode: boolean): ThemeConfig {
  return {
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDarkMode ? colors.brand.primaryOnDark : colors.brand.primary,
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
        controlHeight: sizes.control,
        borderRadius: radius.control,
        fontWeight: 600,
        primaryShadow: 'none',
        defaultShadow: 'none',
        dangerShadow: 'none',
      },
      Input: {
        controlHeight: sizes.control,
        borderRadius: radius.control,
        colorBorder: isDarkMode ? colors.hairline.dark : colors.hairline.light,
      },
      InputNumber: {
        controlHeight: sizes.control,
        borderRadius: radius.control,
      },
      Select: {
        controlHeight: sizes.control,
        borderRadius: radius.control,
        optionHeight: 38,
        optionPadding: '8px 12px',
        optionFontSize: 13.5,
        optionSelectedFontWeight: 500,
        optionSelectedColor: isDarkMode ? colors.brand.primaryOnDark : colors.brand.primary,
        optionSelectedBg: isDarkMode ? 'rgba(69, 153, 255, 0.16)' : 'rgba(0, 100, 224, 0.08)',
        optionActiveBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : colors.canvas.light,
      },
      DatePicker: {
        controlHeight: sizes.control,
        borderRadius: radius.control,
      },
      Card: {
        borderRadiusLG: radius.lg,
        colorBorderSecondary: isDarkMode ? colors.hairline.dark : colors.hairline.light,
        boxShadow: 'none',
      },
      Table: {
        borderRadius: radius.lg,
        headerBg: isDarkMode ? '#0f161a' : colors.canvas.softLight,
        headerColor: isDarkMode ? colors.text.inkDark : colors.text.inkLight,
        borderColor: isDarkMode ? colors.hairline.dark : colors.hairline.light,
      },
      Menu: {
        colorBgContainer: 'transparent',
        subMenuItemBg: 'transparent',
        itemBorderRadius: radius.md,
        itemHeight: 40,
        itemBg: 'transparent',
        itemColor: isDarkMode ? colors.text.bodyDark : colors.text.bodyLight,
        itemHoverBg: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(10, 19, 23, 0.04)',
        itemHoverColor: isDarkMode ? colors.text.inkDark : colors.text.inkLight,
        itemSelectedBg: isDarkMode ? 'rgba(69, 153, 255, 0.16)' : 'rgba(0, 145, 255, 0.12)',
        itemSelectedColor: isDarkMode ? colors.brand.primaryOnDark : colors.brand.primary,
        groupTitleColor: colors.text.mutedLight,
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
