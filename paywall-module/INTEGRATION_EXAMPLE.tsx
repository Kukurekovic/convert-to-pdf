/**
 * Complete Integration Example for Paywall Module
 *
 * This file shows how to integrate the paywall module into a new React Native + Expo app.
 * Copy this as a starting point for your App.tsx file.
 */

import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

// Import the paywall module
import {
  PaywallProvider,
  usePaywallGate,
  useRevenueCat,
  Paywall,
  UpgradeModal,
  TrialLimitModal,
} from './paywall-module';

// ============================================
// 1. CONFIGURE THE PAYWALL
// ============================================

const paywallConfig = {
  revenueCat: {
    // IMPORTANT: Replace with your own RevenueCat API keys
    iosApiKey: 'appl_YOUR_IOS_API_KEY_HERE',
    androidApiKey: 'goog_YOUR_ANDROID_API_KEY_HERE',
    entitlementId: 'premium', // Your RevenueCat entitlement ID
    logLevel: 'INFO' as const, // 'VERBOSE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  },

  trial: {
    enabled: true,          // Enable trial limits
    workoutLimit: 7,        // 7 workouts allowed in trial period
    durationDays: 7,        // Trial period lasts 7 days
  },

  links: {
    privacyPolicy: 'https://YOUR_WEBSITE.com/privacy', // REQUIRED
    termsOfService: 'https://YOUR_WEBSITE.com/terms',  // Optional
  },

  // Optional: Custom gift image
  // assets: {
  //   giftImage: require('./assets/my-gift.png'),
  // },
};

// ============================================
// 2. DEFINE TRANSLATIONS
// ============================================

const translations = {
  en: {
    paywall: {
      title: 'Unlock Premium',
      features: {
        savedRoutines: 'Unlock saved routines',
        unlimitedSessions: 'Unlimited training sessions',
        voiceCues: 'Voice cues for intervals',
        removePaywalls: 'Remove annoying paywalls',
      },
      plans: {
        yearly: 'Yearly Plan',
        yearlyPrice: '{{price}} per year',
        trial: '7-Day Trial',
        trialPrice: 'then {{price}} per month',
        bestValue: 'BEST VALUE',
        freeTrial: 'FREE TRIAL',
      },
      freeTrialEnabled: 'Free Trial Enabled',
      buttons: {
        unlockNow: 'Unlock Now',
        tryFree: 'Try for Free',
        restore: 'Restore',
      },
      links: {
        privacy: 'Privacy Policy',
      },
    },
    upgrade: {
      title: 'Upgrade',
      message: 'Enjoy unlimited workout saves with the full version!',
      buttons: {
        learnMore: 'Learn More',
        alreadyPaid: 'Already Paid?',
        noThanks: 'No Thanks!',
      },
    },
    trialLimit: {
      title: 'Upgrade to Premium',
      message: 'Please upgrade to Premium Features. The free version is limited to 7 workouts every 7 days.',
      buttons: {
        learnMore: 'Learn More',
        maybeLater: 'Maybe Later',
      },
    },
  },
  // Add more languages here if needed
};

// Optional: Custom theme to match your brand
const customTheme = {
  colors: {
    primary: '#3B82F6',     // Your primary color
    accent: '#EF4444',      // Accent color for badges
    // ... other colors (see README for full list)
  },
};

// ============================================
// 3. APP CONTENT COMPONENT
// ============================================

function AppContent() {
  const {
    isSubscriber,
    showPaywall,
    setShowPaywall,
    offerings,
    ensureGateBeforeStart,
    isAppBootLoading,
  } = usePaywallGate();

  const { subscribe, restore } = useRevenueCat(
    // These callbacks are called after purchase/restore
    (newIsSubscriber) => {
      console.log('Subscription status changed:', newIsSubscriber);
    },
    (newShowPaywall) => {
      console.log('Paywall visibility changed:', newShowPaywall);
    }
  );

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTrialLimitModal, setShowTrialLimitModal] = useState(false);

  // Wait for RevenueCat to initialize
  if (isAppBootLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Example: Feature gating for "Save Workout"
  const handleSaveWorkout = () => {
    if (!isSubscriber) {
      setShowUpgradeModal(true);
      return;
    }
    // Save workout logic here
    console.log('Saving workout...');
  };

  // Example: Trial limit enforcement
  const handleStartWorkout = async () => {
    const allowed = await ensureGateBeforeStart();
    if (!allowed) {
      // Trial limit reached, TrialLimitModal will be shown automatically
      return;
    }
    // Start workout logic here
    console.log('Starting workout...');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Fitness App</Text>

      <Text style={styles.subtitle}>
        {isSubscriber ? 'Premium User ✓' : 'Free User'}
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="Start Workout" onPress={handleStartWorkout} />
        <Button title="Save Workout" onPress={handleSaveWorkout} />
        <Button title="Show Paywall" onPress={() => setShowPaywall(true)} />
      </View>

      {/* Main Paywall Modal */}
      <Paywall
        visible={showPaywall}
        isSubscriber={isSubscriber}
        offerings={offerings}
        onClose={() => setShowPaywall(false)}
        onSubscribe={subscribe}
        onRestore={restore}
      />

      {/* Upgrade Modal (when user tries premium feature) */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onLearnMore={() => {
          setShowUpgradeModal(false);
          setShowPaywall(true);
        }}
        onRestore={restore}
      />

      {/* Trial Limit Modal (when trial limit reached) */}
      <TrialLimitModal
        visible={showTrialLimitModal}
        onClose={() => setShowTrialLimitModal(false)}
        onLearnMore={() => {
          setShowTrialLimitModal(false);
          setShowPaywall(true);
        }}
      />
    </View>
  );
}

// ============================================
// 4. ROOT APP COMPONENT
// ============================================

export default function App() {
  // Load fonts (required for paywall module)
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Or your loading screen
  }

  return (
    <PaywallProvider
      config={paywallConfig}
      theme={customTheme}  // Optional: omit to use default theme
      translations={translations}
    >
      <AppContent />
    </PaywallProvider>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 15,
  },
});
