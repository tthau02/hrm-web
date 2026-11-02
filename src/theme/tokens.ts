/**
 * HRM Web Design Tokens - Conforming to DESIGN.md (Cursor Design System)
 */

export const colors = {
  brand: {
    primary: '#f54e00', // Cursor Orange
    primaryHover: '#d04200',
    primaryActive: '#b33900',
    onPrimary: '#ffffff',
  },
  canvas: {
    light: '#f7f7f4', // Warm cream page floor
    dark: '#141414',
    softLight: '#fafaf7',
    softDark: '#1a1a1a',
  },
  surface: {
    cardLight: '#ffffff',
    cardDark: '#1e1e1e',
    strongLight: '#e6e5e0',
    strongDark: '#282828',
  },
  hairline: {
    light: '#e6e5e0', // 1px divider
    dark: '#2d2d2d',
    softLight: '#efeee8',
    softDark: '#222222',
    strongLight: '#cfcdc4',
    strongDark: '#383838',
  },
  text: {
    inkLight: '#26251e', // Display and bold emphasis
    inkDark: '#f0ede6',
    bodyLight: '#5a5852', // Standard reading text
    bodyDark: '#a3a096',
    mutedLight: '#807d72', // Subtitles & captions
    mutedDark: '#6e6b62',
    onPrimary: '#ffffff',
  },
  timeline: {
    thinking: '#dfa88f', // Peach
    grep: '#9fc9a2', // Mint
    read: '#9fbbe0', // Pastel Blue
    edit: '#c0a8dd', // Lavender
    done: '#c08532', // Warm Gold
  },
  semantic: {
    success: '#1f8a65',
    error: '#cf2d56',
    warning: '#c08532',
    info: '#9fbbe0',
  },
} as const;

export const spacing = {
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s20: 20,
  s24: 24,
  s32: 32,
  s48: 48,
  s80: 80, // Section rhythm
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8, // Standard button & input radius (compact developer dialect)
  lg: 12, // Card & modal radius
  pill: 9999,
} as const;

export const typography = {
  fontSans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;
