import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Urbanist_400Regular, Urbanist_600SemiBold, Urbanist_700Bold } from '@expo-google-fonts/urbanist';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './navigation/RootNavigator';
import { useOnboardingStore } from './store/useOnboardingStore';
// @ts-ignore - Paywall module has internal TS errors but works at runtime
import { PaywallProvider } from './paywall-module';
import i18n from './i18n';
import './i18n'; // Initialize i18n

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Paywall configuration
const paywallConfig = {
  revenueCat: {
    iosApiKey: 'appl_xxxxxxxxxx',
    androidApiKey: 'goog_xxxxxxxxxx',
    entitlementId: 'premium',
    logLevel: 'INFO' as const,
  },
  trial: {
    enabled: false,
    workoutLimit: 0,
    durationDays: 0,
  },
  links: {
    privacyPolicy: 'https://www.makefast.app/privacy',
  },
};

const paywallTheme = {
  colors: {
    primary: '#2350E0',
    feature: {
      icon: '#2350E0',
    },
  },
  fonts: {
    bold: 'Urbanist_700Bold',
    semiBold: 'Urbanist_600SemiBold',
    regular: 'Urbanist_400Regular',
  },
};

// Create translations object that includes both app and paywall translations
const paywallTranslations = {
  en: i18n.translations.en,
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });

  const isLoading = useOnboardingStore((state) => state.isLoading);

  // Combined loading state - wait for both fonts and onboarding state
  const isReady = fontsLoaded && !isLoading;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null; // Splash screen will still be visible
  }

  return (
    <PaywallProvider
      config={paywallConfig}
      theme={paywallTheme}
      translations={paywallTranslations}
    >
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </PaywallProvider>
  );
}
