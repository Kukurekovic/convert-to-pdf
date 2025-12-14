import { Platform } from 'react-native';
import { useFonts } from '@expo-google-fonts/inter';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { usePaywallTheme } from '../contexts/PaywallThemeContext';

/**
 * Internal hook for font family management
 *
 * Replaces the old getFontFamily prop pattern.
 * Loads fonts and returns a function to get font family styles.
 *
 * Features:
 * - Uses theme fonts from PaywallTheme
 * - Platform-specific fallbacks for Android/iOS
 * - Automatic font loading via @expo-google-fonts/inter
 *
 * @returns Function that takes a font weight and returns a style object
 */
export const useFontFamily = () => {
  const theme = usePaywallTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  return (weight: 'regular' | 'semiBold' | 'bold') => {
    const fontMap = {
      regular: theme.fonts.regular,
      semiBold: theme.fonts.semiBold,
      bold: theme.fonts.bold,
    };

    // If fonts are loaded, use them
    if (fontsLoaded) {
      return { fontFamily: fontMap[weight] };
    }

    // Platform-specific fallbacks when fonts aren't loaded yet
    if (Platform.OS === 'android') {
      const fallbacks = {
        regular: 'sans-serif',
        semiBold: 'sans-serif-medium',
        bold: 'sans-serif-bold',
      };
      return { fontFamily: fallbacks[weight] };
    }

    // iOS fallback
    return { fontFamily: 'System' };
  };
};
