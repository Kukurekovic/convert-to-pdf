// src/theme/theme.js
// Light-mode theme compatible with NativeWind + responsive.js

import { RF, RS } from '../utils/responsive';

const theme = {
  // 🎨 COLOR PALETTE (Light mode only)
  colors: {
    primary: '#3E7BFA',
    primaryDark: '#2F5FCC',
    primaryLight: '#AECBFF',

    secondary: '#FF7F50',
    secondaryDark: '#CC653F',

    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#E53935',

    background: '#FFFFFF',
    surface: '#F7F7F7',
    border: '#E1E1E1',

    text: '#1A1A1A',
    textLight: '#777777',

    white: '#FFFFFF',
    black: '#000000',
  },

  // 🔤 RESPONSIVE TYPOGRAPHY (matching tailwind scale)
  typography: {
    h1: { fontSize: RF(32), fontWeight: '700', color: '#1A1A1A' },
    h2: { fontSize: RF(28), fontWeight: '700', color: '#1A1A1A' },
    h3: { fontSize: RF(24), fontWeight: '600', color: '#1A1A1A' },

    body: { fontSize: RF(16), color: '#1A1A1A' },
    bodySmall: { fontSize: RF(14), color: '#777777' },
    caption: { fontSize: RF(12), color: '#777777' },
  },

  // 📏 RESPONSIVE SPACING SCALE (mirrors tailwind 4–48)
  spacing: {
    xs: RS(4),
    sm: RS(8),
    md: RS(16),
    lg: RS(24),
    xl: RS(32),
    '2xl': RS(48),
  },

  // 🔲 RADIUS (matches NativeWind rounding utilities)
  radius: {
    sm: RS(4),
    md: RS(8),
    lg: RS(12),
    xl: RS(16),
    full: 9999,
  },

  // ☁ Shadows (compatible with NativeWind’s shadow classes)
  shadows: {
    light: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,
      shadowRadius: 8,
      elevation: 8,
    },
  },

  // 🔘 Component defaults (optional but nice)
  components: {
    button: {
      height: RS(48),
      paddingVertical: RS(12),
      paddingHorizontal: RS(16),
      borderRadius: RS(10),
      fontSize: RF(16),
      color: '#FFFFFF',
    },
  },
};

export { theme };
export default theme;
