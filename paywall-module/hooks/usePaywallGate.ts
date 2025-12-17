import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { usePaywallConfig } from '../contexts/PaywallConfigContext';
import { usePaywallVisibility } from '../contexts/PaywallVisibilityContext';
import { UsePaywallGate } from '../types';

/**
 * Main hook for managing paywall gate logic
 *
 * This hook handles:
 * - RevenueCat initialization
 * - Subscription status checking
 * - Offerings fetching
 * - Trial limit enforcement (configurable)
 * - Onboarding completion tracking
 *
 * All configuration (API keys, trial limits, storage keys) comes from PaywallConfig context.
 *
 * @param setShowTrialLimitModal - Optional callback to show trial limit modal
 * @returns Paywall gate state and functions
 */
export function usePaywallGate(setShowTrialLimitModal?: (v: boolean) => void): UsePaywallGate {
  const config = usePaywallConfig();
  const { showPaywall, setShowPaywall } = usePaywallVisibility();

  const [isAppBootLoading, setIsAppBootLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [offerings, setOfferings] = useState<any>(null);
  const [revenueCatConfigured, setRevenueCatConfigured] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const flag = await AsyncStorage.getItem(config.asyncStorageKeys!.onboardingCompleted);
        setIsOnboardingComplete(flag === 'true');

        let hasPremium = false;
        let configurationSucceeded = false;

        try {
          // Set log level from config
          const logLevelMap = {
            VERBOSE: Purchases.LOG_LEVEL.VERBOSE,
            DEBUG: Purchases.LOG_LEVEL.DEBUG,
            INFO: Purchases.LOG_LEVEL.INFO,
            WARN: Purchases.LOG_LEVEL.WARN,
            ERROR: Purchases.LOG_LEVEL.ERROR,
          };
          Purchases.setLogLevel(logLevelMap[config.revenueCat.logLevel || 'INFO']);

          // Configure RevenueCat with API keys from config
          if (Platform.OS === 'ios') {
            await Purchases.configure({ apiKey: config.revenueCat.iosApiKey });
            configurationSucceeded = true;
            setRevenueCatConfigured(true);
            console.log('[PaywallModule] RevenueCat configured successfully for iOS');
          } else if (Platform.OS === 'android') {
            await Purchases.configure({ apiKey: config.revenueCat.androidApiKey });
            configurationSucceeded = true;
            setRevenueCatConfigured(true);
            console.log('[PaywallModule] RevenueCat configured successfully for Android');
          }
        } catch (error) {
          console.warn('[PaywallModule] RevenueCat configuration failed:', error);
          setRevenueCatConfigured(false);
          configurationSucceeded = false;
          // Continue without RevenueCat - app will work but paywall will be bypassed
        }

        // Only try to get customer info and offerings if configuration succeeded
        if (configurationSucceeded) {
          try {
            const info = await Purchases.getCustomerInfo();
            console.log('[PaywallModule] Customer info:', info);
            hasPremium = Boolean(info?.entitlements?.active?.[config.revenueCat.entitlementId]);
            setIsSubscriber(hasPremium);
          } catch (error) {
            console.warn('[PaywallModule] Failed to get customer info:', error);
          }

          try {
            const offs = await Purchases.getOfferings();
            console.log('[PaywallModule] 📦 Available Offerings:', offs);

            // Log available packages for debugging
            if (offs?.current?.availablePackages) {
              console.log('[PaywallModule] 📋 Available Packages:');
              offs.current.availablePackages.forEach((pkg: any, index: number) => {
                console.log(`  ${index + 1}. ${pkg.identifier} (${pkg.packageType}) - ${pkg.product?.title || 'No title'} - ${pkg.product?.priceString || 'No price'}`);
              });
            }

            setOfferings(offs);
          } catch (error) {
            console.warn('[PaywallModule] Failed to get offerings:', error);
          }
        } else {
          console.log('[PaywallModule] Skipping RevenueCat API calls due to configuration failure');
        }
      } finally {
        setIsAppBootLoading(false);
      }
    })();
  }, [config]);

  const ensureGateBeforeStart = async () => {
    if (isSubscriber) return true;
    if (showPaywall) return false; // Paywall already showing

    // If trial is disabled, always allow
    if (!config.trial?.enabled) {
      console.log('[PaywallModule] ✅ Trial disabled - allowing start');
      return true;
    }

    try {
      const completedStr = await AsyncStorage.getItem(config.asyncStorageKeys!.completedWorkouts);
      const completedCount = completedStr ? parseInt(completedStr, 10) : 0;
      const timestampStr = await AsyncStorage.getItem(config.asyncStorageKeys!.firstWorkoutTimestamp);

      // If no workouts yet, allow (first workout is always free)
      if (completedCount === 0) {
        console.log('[PaywallModule] ✅ First workout - allowing start');
        return true;
      }

      // Get trial limits from config
      const { workoutLimit, durationDays } = config.trial!;

      // Check if trial period has passed
      if (timestampStr) {
        const firstWorkoutTime = parseInt(timestampStr, 10);
        const now = Date.now();
        const daysPassed = (now - firstWorkoutTime) / (1000 * 60 * 60 * 24);

        // If duration has passed, reset trial and start new period
        if (daysPassed >= durationDays) {
          console.log(`[PaywallModule] 🔄 ${durationDays} days passed - resetting trial period`);
          await AsyncStorage.setItem(config.asyncStorageKeys!.completedWorkouts, '0');
          await AsyncStorage.setItem(config.asyncStorageKeys!.firstWorkoutTimestamp, String(now));
          console.log('[PaywallModule] ✅ New trial started - allowing start');
          return true;
        }

        // Within trial window: check if user has used all workouts
        if (completedCount >= workoutLimit) {
          const daysRemaining = Math.ceil(durationDays - daysPassed);
          console.log(`[PaywallModule] 🚫 Trial limit reached: ${completedCount}/${workoutLimit} workouts used. ${daysRemaining} days until reset.`);
          if (setShowTrialLimitModal) {
            setShowTrialLimitModal(true);
          } else {
            setShowPaywall(true); // Fallback to paywall if callback not provided
          }
          return false;
        }

        // Within limit - allow workout
        console.log(`[PaywallModule] ✅ Trial active: ${completedCount}/${workoutLimit} workouts, ${Math.ceil(durationDays - daysPassed)} days remaining`);
        return true;
      }

      // No timestamp but has workouts (legacy data) - allow and will set timestamp on next completion
      console.log('[PaywallModule] ✅ Legacy data detected - allowing start');
      return true;

    } catch (error) {
      console.warn('[PaywallModule] Error checking trial status:', error);
      return true; // Allow on error to avoid blocking users
    }
  };

  const triggerPaywallAfterOnboarding = () => {
    if (!isSubscriber && !showPaywall) {
      console.log('[PaywallModule] 🎯 Triggering paywall after onboarding completion');
      setShowPaywall(true);
    }
  };

  return {
    isAppBootLoading,
    isOnboardingComplete,
    setIsOnboardingComplete,
    showPaywall,
    setShowPaywall,
    isSubscriber,
    setIsSubscriber,
    offerings,
    ensureGateBeforeStart,
    triggerPaywallAfterOnboarding,
  };
}
