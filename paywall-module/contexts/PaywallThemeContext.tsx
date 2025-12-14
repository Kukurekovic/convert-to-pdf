import React, { createContext, useContext, ReactNode } from 'react';
import { PaywallTheme } from '../types';

const PaywallThemeContext = createContext<PaywallTheme | undefined>(undefined);

export interface PaywallThemeProviderProps {
  children: ReactNode;
  theme: PaywallTheme;
}

export const PaywallThemeProvider: React.FC<PaywallThemeProviderProps> = ({ children, theme }) => {
  return (
    <PaywallThemeContext.Provider value={theme}>
      {children}
    </PaywallThemeContext.Provider>
  );
};

export const usePaywallTheme = (): PaywallTheme => {
  const context = useContext(PaywallThemeContext);
  if (!context) {
    throw new Error('usePaywallTheme must be used within PaywallThemeProvider');
  }
  return context;
};
