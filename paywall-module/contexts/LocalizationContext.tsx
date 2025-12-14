import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { i18n, initializeI18n, getCurrentLocale } from '../utils/i18n';
import { LocalizationContextType, LocalizationProviderProps } from '../types';

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children, translations }) => {
  const [locale, setLocale] = useState<string>(getCurrentLocale());

  useEffect(() => {
    // Initialize i18n with provided translations on mount
    const initialLocale = initializeI18n(translations);
    setLocale(initialLocale);
  }, [translations]);

  const t = (key: string, params?: Record<string, any>): string => {
    return i18n.t(key, params);
  };

  const changeLocale = (newLocale: string) => {
    i18n.locale = newLocale;
    setLocale(newLocale);
  };

  return (
    <LocalizationContext.Provider value={{ t, locale, changeLocale }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
