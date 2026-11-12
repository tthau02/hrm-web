/**
 * SASCO Duty-Free WMS Design Tokens - Cobalt + cool-grey palette (see DESIGN.md)
 */

export const colors = {
  brand: {
    primary: '#0064e0', // Cobalt Primary
    primaryHover: '#0457cb',
    primaryOnDark: '#4599ff', // lighter blue for dark mode legibility
    primaryActive: '#0346a3',
    onPrimary: '#ffffff',
    gold: '#ccad6a', // SASCO Duty-free Gold - accent
    goldSoft: '#fcf3d6',
  },
  canvas: {
    light: '#e6ebf1', // Cool blue-grey page floor
    dark: '#0a1317',
    softLight: '#f7f9fb',
    softDark: '#0f161a',
  },
  surface: {
    cardLight: '#ffffff',
    cardDark: '#141c21',
    strongLight: '#dee3e9',
    strongDark: '#1c262d',
  },
  hairline: {
    light: '#dee3e9', // 1px divider
    dark: '#2a353d',
    softLight: '#e9edf1',
    softDark: '#192229',
    strongLight: '#ced0d4',
    strongDark: '#33404a',
  },
  text: {
    inkLight: '#0a1317', // Display and bold emphasis
    inkDark: '#eef2f5',
    bodyLight: '#444950', // Standard reading text
    bodyDark: '#a9b4be',
    mutedLight: '#5d6c7b', // Subtitles & captions
    mutedDark: '#8595a4',
    onPrimary: '#ffffff',
  },
  semantic: {
    success: '#1f8a65',
    error: '#cf2d56',
    warning: '#b7791f',
    info: '#0064e0',
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

export const sizes = {
  control: 42, // Height of inputs & buttons (keep in sync with --height-control in common.css)
} as const;

export const radius = {
  xs: 6,
  sm: 8,
  md: 12, // Standard button & input radius
  lg: 16, // Card & modal radius
  control: 20, // Inputs & buttons (keep in sync with --radius-control in common.css)
  pill: 9999,
} as const;

export const typography = {
  fontSans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const;
