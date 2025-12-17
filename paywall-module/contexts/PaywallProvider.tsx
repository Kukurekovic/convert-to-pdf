import React from 'react';
import { PaywallProviderProps } from '../types';
import { mergeConfig } from '../config/paywall.config';
import { mergeTheme } from '../theme/paywallTheme';
import { PaywallConfigProvider } from './PaywallConfigContext';
import { PaywallThemeProvider } from './PaywallThemeContext';
import { LocalizationProvider } from './LocalizationContext';
import { PaywallVisibilityProvider } from './PaywallVisibilityContext';

/**
 * Main provider component for the Paywall module
 *
 * Wraps your app with all necessary contexts:
 * - PaywallConfig (API keys, trial settings, etc.)
 * - PaywallTheme (colors, fonts, etc.)
 * - Localization (i18n translations)
 *
 * @example
 * ```tsx
 * import { PaywallProvider } from './paywall-module';
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
 *       theme={{
 *         colors: {
 *           primary: '#10B981', // Green
 *         },
 *       }}
 *       translations={myTranslations}
 *     >
 *       <YourApp />
 *     </PaywallProvider>
 *   );
 * }
 * ```
 */
export const PaywallProvider: React.FC<PaywallProviderProps> = ({
  children,
  config,
  theme = {},
  translations,
}) => {
  // Merge user config with defaults and validate
  const mergedConfig = mergeConfig(config);

  // Merge user theme with defaults
  const mergedTheme = mergeTheme(theme);

  return (
    <PaywallConfigProvider config={mergedConfig}>
      <PaywallThemeProvider theme={mergedTheme}>
        <LocalizationProvider translations={translations}>
          <PaywallVisibilityProvider>
            {children}
          </PaywallVisibilityProvider>
        </LocalizationProvider>
      </PaywallThemeProvider>
    </PaywallConfigProvider>
  );
};
