import en from './en';

/**
 * Default translations for the Paywall module
 *
 * Only English is included by default.
 * Consumer apps should provide their own translations object with all required keys.
 */
export const defaultTranslations = {
  en,
};

/**
 * Required translation keys for the Paywall module
 *
 * Consumer apps must provide translations for these keys.
 * You can use this as a template for creating translations in other languages.
 */
export const requiredTranslationKeys = {
  paywall: {
    title: 'string',
    features: {
      savedRoutines: 'string',
      unlimitedSessions: 'string',
      voiceCues: 'string',
      removePaywalls: 'string',
    },
    plans: {
      yearly: 'string',
      yearlyPrice: 'string (with {{price}} placeholder)',
      trial: 'string',
      trialPrice: 'string (with {{price}} placeholder)',
      bestValue: 'string',
      freeTrial: 'string',
    },
    freeTrialEnabled: 'string',
    buttons: {
      unlockNow: 'string',
      tryFree: 'string',
      restore: 'string',
    },
    links: {
      terms: 'string',
      privacy: 'string',
    },
  },
  upgrade: {
    title: 'string',
    message: 'string',
    buttons: {
      learnMore: 'string',
      alreadyPaid: 'string',
      noThanks: 'string',
    },
  },
  trialLimit: {
    title: 'string',
    message: 'string',
    buttons: {
      learnMore: 'string',
      maybeLater: 'string',
    },
  },
};

/**
 * Helper function to validate that consumer translations include all required keys
 *
 * @param translations - Consumer's translation object
 * @returns Array of missing keys (empty if all keys are present)
 */
export function validateTranslations(translations: Record<string, any>): string[] {
  const missing: string[] = [];

  function checkKeys(obj: any, path: string = '') {
    for (const key in obj) {
      const fullPath = path ? `${path}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        checkKeys(obj[key], fullPath);
      }
    }
  }

  // Check if English translations exist (minimum requirement)
  if (!translations.en) {
    missing.push('en (English translations are required as fallback)');
  } else {
    checkKeys(requiredTranslationKeys);
  }

  return missing;
}
