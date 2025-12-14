/**
 * Paywall Module - Reusable RevenueCat Subscription System
 *
 * A complete, themeable, and configurable paywall system for React Native + Expo apps.
 *
 * @example
 * ```tsx
 * import { PaywallProvider, usePaywallGate, Paywall, useRevenueCat } from './paywall-module';
 *
 * function App() {
 *   return (
 *     <PaywallProvider
 *       config={{
 *         revenueCat: {
 *           iosApiKey: 'appl_xxx',
 *           androidApiKey: 'goog_xxx',
 *           entitlementId: 'premium',
 *         },
 *         links: {
 *           privacyPolicy: 'https://myapp.com/privacy',
 *         },
 *       }}
 *       translations={myTranslations}
 *     >
 *       <AppContent />
 *     </PaywallProvider>
 *   );
 * }
 * ```
 */

// ============================================
// Provider
// ============================================
export { PaywallProvider } from './contexts/PaywallProvider';

// ============================================
// Components
// ============================================
export { default as Paywall } from './components/Paywall';
export { default as UpgradeModal } from './components/UpgradeModal';
export { default as TrialLimitModal } from './components/TrialLimitModal';

// ============================================
// Hooks
// ============================================
export { usePaywallGate } from './hooks/usePaywallGate';
export { useRevenueCat } from './hooks/useRevenueCat';
export { useResponsive } from './hooks/useResponsive';
export { useFontFamily } from './hooks/useFontFamily';

// Context hooks (if consumers need them)
export { usePaywallConfig } from './contexts/PaywallConfigContext';
export { usePaywallTheme } from './contexts/PaywallThemeContext';
export { useLocalization } from './contexts/LocalizationContext';

// ============================================
// Configuration & Theme
// ============================================
export { defaultConfig, validateConfig, mergeConfig } from './config/paywall.config';
export { defaultTheme, mergeTheme, getFontStyle } from './theme/paywallTheme';

// ============================================
// Localization
// ============================================
export { defaultTranslations, requiredTranslationKeys, validateTranslations } from './locales';
export { default as enTranslations } from './locales/en';

// ============================================
// TypeScript Types
// ============================================
export type {
  PaywallConfig,
  PaywallTheme,
  UsePaywallGate,
  UseRevenueCat,
  UseResponsiveValues,
  PaywallProps,
  UpgradeModalProps,
  TrialLimitModalProps,
  PaywallProviderProps,
  LocalizationContextType,
  LocalizationProviderProps,
} from './types';
