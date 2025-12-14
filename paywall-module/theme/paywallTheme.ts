import { PaywallTheme } from '../types';

/**
 * Default theme for the paywall module
 *
 * Matches the original Tabata Timer design:
 * - Primary: Blue (#3B82F6)
 * - Accent: Red (#EF4444)
 * - Fonts: Inter family
 */
export const defaultTheme: PaywallTheme = {
  colors: {
    primary: '#3B82F6',      // Blue - primary button background
    primaryText: '#FFFFFF',   // White - primary button text
    accent: '#EF4444',        // Red - "BEST VALUE" badge
    background: '#FFFFFF',    // White - modal background
    text: {
      primary: '#111827',     // Near black - main text
      secondary: '#6B7280',   // Gray - subtitle text
      muted: '#9CA3AF',       // Light gray - links and muted text
    },
    border: {
      default: '#D1D5DB',     // Light gray - default border
      selected: '#3B82F6',    // Blue - selected border
    },
    feature: {
      icon: '#3B82F6',        // Blue - feature list icons
    },
  },

  fonts: {
    bold: 'Inter_700Bold',
    semiBold: 'Inter_600SemiBold',
    regular: 'Inter_400Regular',
  },

  fontScale: {
    title: 1.0,
    subtitle: 1.0,
    body: 1.0,
  },
};

/**
 * Merges user theme with default theme
 * Deep merge for nested objects
 */
export function mergeTheme(userTheme?: Partial<PaywallTheme>): PaywallTheme {
  if (!userTheme) return defaultTheme;

  return {
    colors: {
      ...defaultTheme.colors,
      ...userTheme.colors,
      text: {
        ...defaultTheme.colors.text,
        ...userTheme.colors?.text,
      },
      border: {
        ...defaultTheme.colors.border,
        ...userTheme.colors?.border,
      },
      feature: {
        ...defaultTheme.colors.feature,
        ...userTheme.colors?.feature,
      },
    },
    fonts: {
      ...defaultTheme.fonts,
      ...userTheme.fonts,
    },
    fontScale: {
      ...defaultTheme.fontScale,
      ...userTheme.fontScale,
    },
  };
}

/**
 * Helper function to get font family style object
 * Useful for applying fonts in components
 */
export function getFontStyle(theme: PaywallTheme, weight: 'regular' | 'semiBold' | 'bold') {
  const fontMap = {
    regular: theme.fonts.regular,
    semiBold: theme.fonts.semiBold,
    bold: theme.fonts.bold,
  };

  return { fontFamily: fontMap[weight] };
}
