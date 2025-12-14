import { ReactNode } from 'react';

// ============================================
// Configuration Types
// ============================================

export interface PaywallConfig {
  revenueCat: {
    iosApiKey: string;
    androidApiKey: string;
    entitlementId: string;
    logLevel?: 'VERBOSE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  };

  trial?: {
    enabled: boolean;
    workoutLimit: number;      // e.g., 7 workouts
    durationDays: number;      // e.g., 7 days
  };

  asyncStorageKeys?: {
    onboardingCompleted: string;
    completedWorkouts: string;
    firstWorkoutTimestamp: string;
  };

  links?: {
    privacyPolicy: string;
    termsOfService?: string;
  };

  assets?: {
    giftImage: any; // require('../assets/gift.png')
  };
}

// ============================================
// Theme Types
// ============================================

export interface PaywallTheme {
  colors: {
    primary: string;        // Button background
    primaryText: string;    // Button text
    accent: string;         // "BEST VALUE" badge
    background: string;     // Modal background
    text: {
      primary: string;      // Main text
      secondary: string;    // Subtitle text
      muted: string;        // Links
    };
    border: {
      default: string;
      selected: string;
    };
    feature: {
      icon: string;         // Feature list icons
    };
  };

  fonts: {
    bold: string;           // 'Inter_700Bold'
    semiBold: string;       // 'Inter_600SemiBold'
    regular: string;        // 'Inter_400Regular'
  };

  // Font size multipliers for customization
  fontScale?: {
    title: number;
    subtitle: number;
    body: number;
  };
}

// ============================================
// Hook Return Types
// ============================================

export interface UsePaywallGate {
  isAppBootLoading: boolean;
  isOnboardingComplete: boolean;
  setIsOnboardingComplete: (v: boolean) => void;
  showPaywall: boolean;
  setShowPaywall: (v: boolean) => void;
  isSubscriber: boolean;
  setIsSubscriber: (v: boolean) => void;
  offerings: any;
  ensureGateBeforeStart: () => Promise<boolean>;
  triggerPaywallAfterOnboarding: () => void;
}

export interface UseRevenueCat {
  subscribe: (pkg: any) => Promise<void>;
  restore: () => Promise<void>;
}

export interface UseResponsiveValues {
  deviceType: 'phone' | 'tablet';
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
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
  scale: (size: number) => number;
  scaleFont: (size: number) => number;
  scaleSpacing: (size: number) => number;
  scaleAndroidCondensed: (size: number) => number;
  scaleAndroidExtraCondensed: (size: number) => number;
  containerPadding: number;
  maxContentWidth: number;
}

// ============================================
// Component Props
// ============================================

export interface PaywallProps {
  visible: boolean;
  isSubscriber: boolean;
  offerings: any;
  onClose: () => void;
  onSubscribe: (pkg: any) => Promise<void> | void;
  onRestore: () => Promise<void> | void;
}

export interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onLearnMore: () => void;
  onRestore: () => void;
}

export interface TrialLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onLearnMore: () => void;
}

// ============================================
// Provider Props
// ============================================

export interface PaywallProviderProps {
  children: ReactNode;
  config: PaywallConfig;
  theme?: Partial<PaywallTheme>;
  translations: Record<string, any>;
}

// ============================================
// Localization Types
// ============================================

export interface LocalizationContextType {
  t: (key: string, params?: Record<string, any>) => string;
  locale: string;
  changeLocale: (locale: string) => void;
}

export interface LocalizationProviderProps {
  children: ReactNode;
  translations: Record<string, any>;
}
