import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PaywallVisibilityContextType {
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
}

const PaywallVisibilityContext = createContext<PaywallVisibilityContextType | undefined>(undefined);

export const PaywallVisibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <PaywallVisibilityContext.Provider value={{ showPaywall, setShowPaywall }}>
      {children}
    </PaywallVisibilityContext.Provider>
  );
};

export const usePaywallVisibility = () => {
  const context = useContext(PaywallVisibilityContext);
  if (!context) {
    throw new Error('usePaywallVisibility must be used within PaywallVisibilityProvider');
  }
  return context;
};
