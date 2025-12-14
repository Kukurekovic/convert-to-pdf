import { PaywallConfig } from '../types';

/**
 * Default configuration for the paywall module
 *
 * These values will be merged with user-provided config.
 * Required fields (revenueCat API keys, entitlementId, privacyPolicy) must be provided by the user.
 */
export const defaultConfig: Partial<PaywallConfig> = {
  revenueCat: {
    logLevel: 'INFO',
    entitlementId: 'premium',
    iosApiKey: '', // Must be provided by user
    androidApiKey: '', // Must be provided by user
  },
  trial: {
    enabled: true,
    workoutLimit: 7,
    durationDays: 7,
  },
  asyncStorageKeys: {
    onboardingCompleted: 'onboardingCompleted',
    completedWorkouts: 'completedWorkouts',
    firstWorkoutTimestamp: 'firstWorkoutTimestamp',
  },
  links: {
    privacyPolicy: '', // Must be provided by user
  },
  assets: {
    giftImage: undefined, // Will use default gift.png if not provided
  },
};

/**
 * Validates the paywall configuration
 * Throws an error if required fields are missing
 */
export function validateConfig(config: PaywallConfig): void {
  const errors: string[] = [];

  if (!config.revenueCat?.iosApiKey) {
    errors.push('revenueCat.iosApiKey is required');
  }

  if (!config.revenueCat?.androidApiKey) {
    errors.push('revenueCat.androidApiKey is required');
  }

  if (!config.revenueCat?.entitlementId) {
    errors.push('revenueCat.entitlementId is required');
  }

  if (!config.links?.privacyPolicy) {
    errors.push('links.privacyPolicy is required');
  }

  if (errors.length > 0) {
    throw new Error(
      `PaywallModule configuration errors:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}

/**
 * Merges user config with defaults
 * Deep merge for nested objects
 */
export function mergeConfig(userConfig: PaywallConfig): PaywallConfig {
  const merged: PaywallConfig = {
    revenueCat: {
      ...defaultConfig.revenueCat,
      ...userConfig.revenueCat,
    },
    trial: {
      ...defaultConfig.trial,
      ...userConfig.trial,
    },
    asyncStorageKeys: {
      ...defaultConfig.asyncStorageKeys,
      ...userConfig.asyncStorageKeys,
    },
    links: {
      ...defaultConfig.links,
      ...userConfig.links,
    },
    assets: {
      ...defaultConfig.assets,
      ...userConfig.assets,
    },
  };

  validateConfig(merged);
  return merged;
}
