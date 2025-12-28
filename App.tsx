import { useState, useCallback, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Urbanist_400Regular, Urbanist_400Regular_Italic, Urbanist_600SemiBold, Urbanist_700Bold } from '@expo-google-fonts/urbanist';
import Toast from 'react-native-toast-message';
import RootNavigator from './navigation/RootNavigator';
import { useOnboardingStore } from './store/useOnboardingStore';
// @ts-ignore - Paywall module has internal TS errors but works at runtime
import { PaywallProvider, usePaywallGate, usePaywallVisibility, useRevenueCat, Paywall } from './paywall-module';
import i18n from './i18n';
import './i18n'; // Initialize i18n
import { theme } from './theme/theme';
import { RF, RS } from './utils/responsive';
import LoadingScreen from './components/LoadingScreen';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Paywall configuration
const paywallConfig = {
  revenueCat: {
    iosApiKey: 'appl_aeSbqpyzDvGrrcnIvpibpZdXnIF',
    androidApiKey: 'goog_csmvEfCPQTMcScYsLEwiggsojbp',
    entitlementId: 'Convert to PDF Premium',
    logLevel: 'DEBUG' as const, // Changed to DEBUG for better error visibility during testing
  },
  trial: {
    enabled: true,
    workoutLimit: 999999, // Unlimited conversions during trial
    durationDays: 7,
  },
  links: {
    privacyPolicy: 'https://www.makefast.app/privacy',
  },
};

const paywallTheme = {
  colors: {
    primary: '#2350E0',
    border: {
      selected: '#2350E0',
    },
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
  pdfDeleted: ({ text1 }: { text1?: string }) => (
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
        {text1 || 'PDF deleted'}
      </Text>
    </View>
  ),
  alreadySubscribed: ({ text1 }: { text1?: string }) => (
    <View style={{
      backgroundColor: theme.colors.textLight,
      paddingVertical: RS(12),
      paddingHorizontal: RS(20),
      borderRadius: RS(8),
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{
        color: '#FFFFFF',
        fontSize: RF(14),
        fontFamily: 'Urbanist_600SemiBold',
      }}>
        {text1}
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
    Urbanist_400Regular_Italic,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });

  const isLoading = useOnboardingStore((state) => state.isLoading);
  const [showCustomLoading, setShowCustomLoading] = useState(true);
  const [fontsReady, setFontsReady] = useState(false);

  // Ensure fonts are fully applied before rendering main content
  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      // Small delay to ensure fonts are fully applied to prevent layout shift
      const timer = setTimeout(() => {
        setFontsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [fontsLoaded, isLoading]);

  // Combined loading state - wait for fonts to be ready
  const resourcesReady = fontsReady;

  const handleLoadingComplete = useCallback(() => {
    setShowCustomLoading(false);
  }, []);

  if (!resourcesReady || showCustomLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
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
