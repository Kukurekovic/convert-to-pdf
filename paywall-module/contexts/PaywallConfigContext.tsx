import React, { createContext, useContext, ReactNode } from 'react';
import { PaywallConfig } from '../types';

const PaywallConfigContext = createContext<PaywallConfig | undefined>(undefined);

export interface PaywallConfigProviderProps {
  children: ReactNode;
  config: PaywallConfig;
}

export const PaywallConfigProvider: React.FC<PaywallConfigProviderProps> = ({ children, config }) => {
  return (
    <PaywallConfigContext.Provider value={config}>
      {children}
    </PaywallConfigContext.Provider>
  );
};

export const usePaywallConfig = (): PaywallConfig => {
  const context = useContext(PaywallConfigContext);
  if (!context) {
    throw new Error('usePaywallConfig must be used within PaywallConfigProvider');
  }
  return context;
};
