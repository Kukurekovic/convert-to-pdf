import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

// Create i18n instance
export const i18n = new I18n({});

// Set fallback locale to English
i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

// Get device locale and set it
export const initializeI18n = (translations: Record<string, any>) => {
  // Set translations
  i18n.translations = translations;

  const deviceLocale = Localization.getLocales()[0];
  const localeString = deviceLocale?.languageTag || 'en';

  console.log('[PaywallModule] Device locale:', localeString);
  console.log('[PaywallModule] Available locales:', Object.keys(translations));

  // Try to find exact match first (e.g., 'zh-CN')
  if (translations[localeString]) {
    i18n.locale = localeString;
    console.log('[PaywallModule] Set locale to:', localeString);
  } else {
    // Try language code only (e.g., 'zh' from 'zh-CN')
    const languageCode = localeString.split('-')[0];
    if (translations[languageCode]) {
      i18n.locale = languageCode;
      console.log('[PaywallModule] Set locale to language code:', languageCode);
    } else {
      // Fallback to English
      i18n.locale = 'en';
      console.log('[PaywallModule] Locale not found, fallback to English');
    }
  }

  return i18n.locale;
};

// Helper function to get current locale
export const getCurrentLocale = (): string => {
  return i18n.locale || 'en';
};

// Helper function to change locale manually
export const changeLocale = (locale: string) => {
  i18n.locale = locale;
};

// Helper function to translate with parameters
export const t = (key: string, params?: Record<string, any>): string => {
  return i18n.t(key, params);
};
