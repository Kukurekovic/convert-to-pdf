import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

type DeviceType = 'phone' | 'tablet';
type ScreenSize = 'small' | 'medium' | 'large' | 'xlarge';

interface ResponsiveValues {
  deviceType: DeviceType;
  screenSize: ScreenSize;
  width: number;
  height: number;
  isTablet: boolean;
  isPhone: boolean;
  isAndroid: boolean;
  isAndroidMediumOrSmall: boolean;
  isAndroidSmall: boolean;
  isAndroidMedium: boolean;
  isAndroid1080px: boolean;
  isLargeScreen: boolean;
  // Responsive scaling functions
  scale: (size: number) => number;
  scaleFont: (size: number) => number;
  scaleSpacing: (size: number) => number;
  scaleAndroidCondensed: (size: number) => number;
  scaleAndroidExtraCondensed: (size: number) => number;
  // Responsive values
  containerPadding: number;
  maxContentWidth: number;
}

export const useResponsive = (): ResponsiveValues => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);

  // Platform detection
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';

  // Device type detection
  const isTablet = minDimension >= 768; // iPad and larger tablets
  const deviceType: DeviceType = isTablet ? 'tablet' : 'phone';

  // Screen size categories
  let screenSize: ScreenSize;
  if (minDimension < 376) {
    screenSize = 'small'; // Small phones
  } else if (minDimension < 414) {
    screenSize = 'medium'; // Standard phones
  } else if (minDimension < 768) {
    screenSize = 'large'; // Large phones
  } else {
    screenSize = 'xlarge'; // Tablets
  }

  // Android medium and small device detection for condensed spacing (exclude 1080px phones)
  const isAndroidMediumOrSmall = isAndroid && !isTablet && (screenSize === 'medium' || screenSize === 'small') && !(width >= 1080 && width < 1280) && !(minDimension >= 1080 && minDimension < 1280);
  
  // Android small device detection for extra condensed spacing (exclude 1080px phones)
  const isAndroidSmall = isAndroid && !isTablet && screenSize === 'small' && !(width >= 1080 && width < 1280) && !(minDimension >= 1080 && minDimension < 1280);
  
  // Android medium device detection (medium screens but not small, exclude 1080px phones)
  const isAndroidMedium = isAndroid && !isTablet && screenSize === 'medium' && !(width >= 1080 && width < 1280) && !(minDimension >= 1080 && minDimension < 1280);
  
  // Android 1080px width detection - treat it as large phone (like 1280px)
  // Use both width and minDimension to catch 1080px phones in both orientations
  const isAndroid1080px = isAndroid && !isTablet && ((width >= 1080 && width < 1280) || (minDimension >= 1080 && minDimension < 1280));
  
  // Large screen detection (tablets and larger)
  const isLargeScreen = minDimension >= 768;

  // Base scaling factor - phones use 1.0, tablets scale up
  const baseScale = isTablet ? Math.min(minDimension / 375, 2.0) : 1.0;
  
  // Responsive scaling functions
  const scale = (size: number): number => {
    // Scale up for Android 1080px width phones (like large phones)
    if (isAndroid1080px) {
      return Math.round(size * 1.1); // 10% increase for 1080px width phones
    }
    return Math.round(size * baseScale);
  };

  const scaleFont = (size: number): number => {
    // Font scaling is more conservative to maintain readability
    const fontScale = isTablet ? Math.min(baseScale * 0.8, 1.5) : (isAndroid1080px ? 1.1 : 1.0);
    return Math.round(size * fontScale);
  };

  const scaleSpacing = (size: number): number => {
    // Scale up spacing for Android 1080px width phones (like large phones)
    if (isAndroid1080px) {
      return Math.round(size * 1.1); // 10% increase for 1080px width phones
    }
    // Spacing scales more aggressively for better layout
    const spacingScale = isTablet ? Math.min(baseScale * 1.2, 2.5) : 1.0;
    return Math.round(size * spacingScale);
  };

  const scaleAndroidCondensed = (size: number): number => {
    // Condensed spacing for Android medium and small devices
    if (isAndroidMediumOrSmall) {
      return Math.round(size * 0.75); // 25% reduction in spacing
    }
    return size;
  };

  const scaleAndroidExtraCondensed = (size: number): number => {
    // Extra condensed spacing for Android small devices (even more reduction)
    if (isAndroidSmall) {
      return Math.round(size * 0.6); // 40% reduction in spacing
    }
    // Medium Android devices get regular condensed spacing
    if (isAndroidMediumOrSmall) {
      return Math.round(size * 0.75); // 25% reduction in spacing
    }
    return size;
  };

  // Responsive container values
  const containerPadding = isTablet ? scaleSpacing(32) : scaleAndroidCondensed(16);
  const maxContentWidth = isTablet ? Math.min(width * 0.8, 800) : width;

  return {
    deviceType,
    screenSize,
    width,
    height,
    isTablet,
    isPhone: !isTablet,
    isAndroid,
    isAndroidMediumOrSmall,
    isAndroidSmall,
    isAndroidMedium,
    isAndroid1080px,
    isLargeScreen,
    scale,
    scaleFont,
    scaleSpacing,
    scaleAndroidCondensed,
    scaleAndroidExtraCondensed,
    containerPadding,
    maxContentWidth,
  };
};

// Utility function for responsive styles
export const createResponsiveStyle = (phoneStyle: any, tabletStyle: any, isTablet: boolean) => {
  return isTablet ? { ...phoneStyle, ...tabletStyle } : phoneStyle;
};

// Responsive dimension helpers
export const responsiveDimensions = {
  // Button heights
  buttonHeight: {
    phone: 48,
    phoneAndroidCondensed: 40, // Reduced for Android medium/small
    tablet: 64,
  },
  // Icon sizes
  iconSize: {
    small: { phone: 16, phoneAndroidCondensed: 14, tablet: 20 },
    medium: { phone: 20, phoneAndroidCondensed: 18, tablet: 28 },
    large: { phone: 24, phoneAndroidCondensed: 20, tablet: 32 },
    xlarge: { phone: 32, phoneAndroidCondensed: 28, tablet: 48 },
  },
  // Font sizes
  fontSize: {
    xs: { phone: 12, phoneAndroidCondensed: 10, tablet: 16 },
    sm: { phone: 14, phoneAndroidCondensed: 12, tablet: 18 },
    base: { phone: 16, phoneAndroidCondensed: 14, tablet: 20 },
    lg: { phone: 18, phoneAndroidCondensed: 16, tablet: 24 },
    xl: { phone: 20, phoneAndroidCondensed: 18, tablet: 28 },
    '2xl': { phone: 24, phoneAndroidCondensed: 20, tablet: 32 },
    '3xl': { phone: 30, phoneAndroidCondensed: 24, tablet: 40 },
  },
  // Spacing
  spacing: {
    xs: { phone: 4, phoneAndroidCondensed: 3, tablet: 6 },
    sm: { phone: 8, phoneAndroidCondensed: 6, tablet: 12 },
    md: { phone: 16, phoneAndroidCondensed: 12, tablet: 24 },
    lg: { phone: 24, phoneAndroidCondensed: 18, tablet: 36 },
    xl: { phone: 32, phoneAndroidCondensed: 24, tablet: 48 },
    '2xl': { phone: 48, phoneAndroidCondensed: 36, tablet: 72 },
  },
};
