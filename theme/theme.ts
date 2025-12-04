// theme/theme.ts
// Light-mode theme compatible with NativeWind + responsive.ts

import { RF, RS } from '../utils/responsive';
import type { Theme } from '../types/theme';

const theme: Theme = {
  // 🎨 COLOR PALETTE (Dark indigo mode)
  colors: {
    primary: '#6366F1',
    primaryDark: '#0077C8',
    primaryLight: '#AECBFF',

    secondary: '#FF7F50',
    secondaryDark: '#CC653F',

    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#E53935',

    background: '#0077C8',
    surface: '#3F3B8C',
    border: '#4C4799',

    text: '#FFFFFF',
    textLight: '#D6D6D6',

    white: '#FFFFFF',
    black: '#000000',
  },

  // 🔤 RESPONSIVE TYPOGRAPHY (matching tailwind scale)
  typography: {
    h1: { fontSize: RF(32), fontWeight: '700', fontFamily: 'Urbanist_700Bold', color: '#000000' },
    h2: { fontSize: RF(28), fontWeight: '700', fontFamily: 'Urbanist_700Bold', color: '#000000' },
    h3: { fontSize: RF(24), fontWeight: '600', fontFamily: 'Urbanist_600SemiBold', color: '#000000' },

    body: { fontSize: RF(16), fontFamily: 'Urbanist_400Regular', color: '#000000' },
    bodySmall: { fontSize: RF(14), fontFamily: 'Urbanist_400Regular', color: '#666666' },
    caption: { fontSize: RF(12), fontFamily: 'Urbanist_400Regular', color: '#666666' },
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

  // ☁ Shadows (compatible with NativeWind's shadow classes)
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
      color: '#000000',
    },
  },
};

export { theme };
export default theme;
