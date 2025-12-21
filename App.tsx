import { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Urbanist_400Regular, Urbanist_600SemiBold, Urbanist_700Bold } from '@expo-google-fonts/urbanist';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import RootNavigator from './navigation/RootNavigator';
import { useOnboardingStore } from './store/useOnboardingStore';
// @ts-ignore - Paywall module has internal TS errors but works at runtime
import { PaywallProvider, usePaywallGate, usePaywallVisibility, useRevenueCat, Paywall } from './paywall-module';
import i18n from './i18n';
import './i18n'; // Initialize i18n
import { theme } from './theme/theme';
import { RF, RS } from './utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Paywall configuration
const paywallConfig = {
  revenueCat: {
    iosApiKey: 'appl_aeSbqpyzDvGrrcnIvpibpZdXnIF',
    androidApiKey: 'goog_csmvEfCPQTMcScYsLEwiggsojbp',
    entitlementId: 'Convert to PDF Premium',
    logLevel: 'INFO' as const,
  },
  trial: {
    enabled: true,
    workoutLimit: 5,
    durationDays: 7,
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

// Custom toast configuration
const toastConfig = {
  pdfSaved: ({ text1 }: { text1?: string }) => (
    <View style={{
      backgroundColor: theme.colors.textLight,
      paddingVertical: RS(12),
      paddingHorizontal: RS(24),
      borderRadius: theme.radius.md,
      alignSelf: 'center',
    }}>
      <Text style={{
        color: theme.colors.white,
        fontSize: RF(14),
        fontFamily: 'Urbanist_600SemiBold',
      }}>
        {text1 || 'PDF saved'}
      </Text>
    </View>
  ),
};

// Internal component that uses paywall hooks
function AppContent() {
  const { showPaywall, setShowPaywall } = usePaywallVisibility();
  const { isSubscriber, offerings } = usePaywallGate();
  const { subscribe, restore } = useRevenueCat(
    (isSubscriber: boolean) => console.log('Subscriber status:', isSubscriber),
    (show: boolean) => setShowPaywall(show)
  );

  return (
    <>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
      <Paywall
        visible={showPaywall}
        isSubscriber={isSubscriber}
        offerings={offerings}
        onClose={() => setShowPaywall(false)}
        onSubscribe={subscribe}
        onRestore={restore}
      />
      <Toast
        config={toastConfig}
        topOffset={SCREEN_HEIGHT / 2 - 50}
      />
    </>
  );
}

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
      <AppContent />
    </PaywallProvider>
  );
}
