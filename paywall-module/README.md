# Paywall Module

A complete, themeable, and configurable paywall system for React Native + Expo apps, powered by RevenueCat.

## Features

✅ **Fully Configurable** - API keys, trial limits, colors, fonts all via config
✅ **Themeable UI** - Easy to match your brand colors and fonts
✅ **Flexible Trial Logic** - Configure workout limits and duration (e.g., 5 workouts/14 days)
✅ **Multi-language Support** - Built-in i18n with English default
✅ **Responsive Design** - Optimized for tablets and phones
✅ **TypeScript** - Full type safety
✅ **Zero NPM overhead** - Just copy the folder into your project

## Installation

### 1. Copy Module to Your Project

```bash
cp -r /path/to/paywall-module ./paywall-module
```

### 2. Install Dependencies

```bash
npm install react-native-purchases @react-native-async-storage/async-storage i18n-js expo-localization @expo/vector-icons react-native-reanimated @expo-google-fonts/inter
```

If using NativeWind (Tailwind):
```bash
npm install nativewind
```

### 3. Set Up RevenueCat

1. Create a RevenueCat account at [revenuecat.com](https://www.revenuecat.com/)
2. Create a new app in RevenueCat dashboard
3. Get your API keys (iOS and Android)
4. Create an entitlement (e.g., "premium")
5. Create subscription products in RevenueCat

## Quick Start

### Basic Usage

```tsx
import React from 'react';
import { PaywallProvider, usePaywallGate, useRevenueCat, Paywall } from './paywall-module';

// Your app's translations (must include paywall keys)
import translations from './locales';

// Configure the paywall
const paywallConfig = {
  revenueCat: {
    iosApiKey: 'appl_YOUR_IOS_KEY',
    androidApiKey: 'goog_YOUR_ANDROID_KEY',
    entitlementId: 'premium',
  },
  links: {
    privacyPolicy: 'https://myapp.com/privacy',
  },
};

function App() {
  return (
    <PaywallProvider
      config={paywallConfig}
      translations={translations}
    >
      <AppContent />
    </PaywallProvider>
  );
}

function AppContent() {
  const {
    isSubscriber,
    showPaywall,
    setShowPaywall,
    offerings,
  } = usePaywallGate();

  const { subscribe, restore } = useRevenueCat(
    (isSubscriber) => console.log('Subscriber status:', isSubscriber),
    (showPaywall) => console.log('Paywall visibility:', showPaywall)
  );

  return (
    <>
      {/* Your app content */}
      <YourApp />

      {/* Paywall modal */}
      <Paywall
        visible={showPaywall}
        isSubscriber={isSubscriber}
        offerings={offerings}
        onClose={() => setShowPaywall(false)}
        onSubscribe={subscribe}
        onRestore={restore}
      />
    </>
  );
}

export default App;
```

## Configuration

### PaywallConfig

```typescript
interface PaywallConfig {
  revenueCat: {
    iosApiKey: string;              // Required
    androidApiKey: string;          // Required
    entitlementId: string;          // Required (e.g., 'premium')
    logLevel?: 'VERBOSE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'; // Default: 'INFO'
  };

  trial?: {
    enabled: boolean;               // Enable/disable trial limits
    workoutLimit: number;           // Number of workouts allowed in trial
    durationDays: number;           // Duration of trial period in days
  };

  asyncStorageKeys?: {
    onboardingCompleted: string;    // Default: 'onboardingCompleted'
    completedWorkouts: string;      // Default: 'completedWorkouts'
    firstWorkoutTimestamp: string;  // Default: 'firstWorkoutTimestamp'
  };

  links?: {
    privacyPolicy: string;          // Required
    termsOfService?: string;        // Optional
  };

  assets?: {
    giftImage: any;                 // Optional custom gift image
  };
}
```

### Example: Custom Trial Limits

```tsx
const paywallConfig = {
  revenueCat: {
    iosApiKey: 'appl_xxx',
    androidApiKey: 'goog_xxx',
    entitlementId: 'premium',
  },
  trial: {
    enabled: true,
    workoutLimit: 5,      // 5 workouts instead of 7
    durationDays: 14,     // 14 days instead of 7
  },
  links: {
    privacyPolicy: 'https://myapp.com/privacy',
  },
};
```

### Example: Disable Trials Entirely

```tsx
const paywallConfig = {
  revenueCat: {
    iosApiKey: 'appl_xxx',
    androidApiKey: 'goog_xxx',
    entitlementId: 'premium',
  },
  trial: {
    enabled: false,       // No trial limits
    workoutLimit: 0,
    durationDays: 0,
  },
  links: {
    privacyPolicy: 'https://myapp.com/privacy',
  },
};
```

## Theming

### PaywallTheme

Customize the paywall colors and fonts to match your brand.

```typescript
interface PaywallTheme {
  colors: {
    primary: string;        // Button background (default: '#3B82F6')
    primaryText: string;    // Button text (default: '#FFFFFF')
    accent: string;         // "BEST VALUE" badge (default: '#EF4444')
    background: string;     // Modal background (default: '#FFFFFF')
    text: {
      primary: string;      // Main text (default: '#111827')
      secondary: string;    // Subtitle text (default: '#6B7280')
      muted: string;        // Links (default: '#9CA3AF')
    };
    border: {
      default: string;      // Default border (default: '#D1D5DB')
      selected: string;     // Selected border (default: '#3B82F6')
    };
    feature: {
      icon: string;         // Feature list icons (default: '#3B82F6')
    };
  };

  fonts: {
    bold: string;           // Default: 'Inter_700Bold'
    semiBold: string;       // Default: 'Inter_600SemiBold'
    regular: string;        // Default: 'Inter_400Regular'
  };

  fontScale?: {
    title: number;          // Default: 1.0
    subtitle: number;       // Default: 1.0
    body: number;           // Default: 1.0
  };
}
```

### Example: Custom Theme

```tsx
<PaywallProvider
  config={paywallConfig}
  theme={{
    colors: {
      primary: '#10B981',     // Green instead of blue
      accent: '#F59E0B',      // Orange instead of red
      feature: {
        icon: '#10B981',      // Green feature icons
      },
    },
    fontScale: {
      title: 1.2,             // Larger titles
      body: 1.1,              // Slightly larger body text
    },
  }}
  translations={translations}
>
  <AppContent />
</PaywallProvider>
```

## Translations

### Required Translation Keys

Your app's translations must include these keys:

```typescript
{
  en: {  // English is required as fallback
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
  // Add other languages here
}
```

### Example: Adding Spanish

```typescript
const translations = {
  en: { /* English translations */ },
  es: {
    paywall: {
      title: 'Desbloquear Premium',
      features: {
        savedRoutines: 'Desbloquear rutinas guardadas',
        unlimitedSessions: 'Sesiones de entrenamiento ilimitadas',
        // ... rest of Spanish translations
      },
      // ...
    },
    // ...
  },
};
```

## API Reference

### Hooks

#### `usePaywallGate()`

Main hook for managing paywall state and trial limits.

```typescript
const {
  isAppBootLoading,           // true while initializing RevenueCat
  isOnboardingComplete,       // onboarding completion status
  setIsOnboardingComplete,    // function to mark onboarding complete
  showPaywall,                // whether to show paywall
  setShowPaywall,             // function to show/hide paywall
  isSubscriber,               // whether user has active subscription
  setIsSubscriber,            // function to update subscriber status
  offerings,                  // RevenueCat offerings object
  ensureGateBeforeStart,      // async function to check trial limits
  triggerPaywallAfterOnboarding, // function to show paywall after onboarding
} = usePaywallGate();
```

**Trial Limit Enforcement:**

```typescript
const handleStartWorkout = async () => {
  const allowed = await ensureGateBeforeStart();
  if (allowed) {
    // Start workout
  } else {
    // Trial limit reached, paywall will be shown
  }
};
```

#### `useRevenueCat()`

Hook for purchase and restore logic.

```typescript
const { subscribe, restore } = useRevenueCat(
  setIsSubscriber,  // callback to update subscriber status
  setShowPaywall    // callback to show/hide paywall
);

// Subscribe to a package
await subscribe(selectedPackage);

// Restore purchases
await restore();
```

#### `useResponsive()`

Responsive design utilities.

```typescript
const {
  isTablet,
  isPhone,
  scaleFont,
  scaleSpacing,
  // ... other responsive utilities
} = useResponsive();
```

### Components

#### `<Paywall />`

Main paywall modal component.

**Props:**
- `visible: boolean` - Controls modal visibility
- `isSubscriber: boolean` - Current subscription status
- `offerings: any` - RevenueCat offerings object
- `onClose: () => void` - Callback when user closes paywall
- `onSubscribe: (pkg: any) => Promise<void>` - Callback when user subscribes
- `onRestore: () => Promise<void>` - Callback when user restores purchases

#### `<UpgradeModal />`

Modal shown when user tries to access premium feature.

**Props:**
- `visible: boolean`
- `onClose: () => void`
- `onLearnMore: () => void` - Typically shows main paywall
- `onRestore: () => void` - Restores purchases

#### `<TrialLimitModal />`

Modal shown when trial limit is reached.

**Props:**
- `visible: boolean`
- `onClose: () => void`
- `onLearnMore: () => void` - Typically shows main paywall

### Example: Feature Gating

```tsx
function SaveWorkoutButton() {
  const { isSubscriber } = usePaywallGate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSave = () => {
    if (!isSubscriber) {
      setShowUpgradeModal(true);
      return;
    }
    // Save workout
  };

  return (
    <>
      <Button onPress={handleSave} title="Save Workout" />

      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onLearnMore={() => {
          setShowUpgradeModal(false);
          setShowPaywall(true);
        }}
        onRestore={restore}
      />
    </>
  );
}
```

## Advanced Usage

### Custom Gift Image

```tsx
const paywallConfig = {
  // ... other config
  assets: {
    giftImage: require('./assets/my-custom-gift.png'),
  },
};
```

### Custom AsyncStorage Keys

```tsx
const paywallConfig = {
  // ... other config
  asyncStorageKeys: {
    onboardingCompleted: 'myapp_onboarding',
    completedWorkouts: 'myapp_workouts',
    firstWorkoutTimestamp: 'myapp_trial_start',
  },
};
```

### Different Log Levels

```tsx
const paywallConfig = {
  revenueCat: {
    iosApiKey: 'appl_xxx',
    androidApiKey: 'goog_xxx',
    entitlementId: 'premium',
    logLevel: 'DEBUG',  // More verbose logging for development
  },
  // ...
};
```

## Troubleshooting

### Paywall doesn't show

**Check:**
1. RevenueCat is configured correctly (API keys, entitlement ID)
2. `showPaywall` state is `true`
3. `isSubscriber` is `false`
4. Offerings loaded successfully (check console logs)

**Console logs to look for:**
```
[PaywallModule] RevenueCat configured successfully for iOS
[PaywallModule] 📦 Available Offerings: ...
[PaywallModule] 📋 Available Packages: ...
```

### Purchases fail

**Check:**
1. RevenueCat API keys are correct
2. Products are set up in App Store Connect / Google Play Console
3. RevenueCat products are linked to store products
4. Test device is configured for sandbox testing

**Console logs to look for:**
```
[PaywallModule] 🛒 User selected plan: ...
[PaywallModule] 💳 Starting purchase process...
[PaywallModule] ✅ Purchase completed: ...
```

### Trial limits not working

**Check:**
1. `trial.enabled` is `true` in config
2. `ensureGateBeforeStart()` is called before starting workout
3. Workout completion updates AsyncStorage:
   ```tsx
   const completedCount = parseInt(await AsyncStorage.getItem('completedWorkouts') || '0', 10);
   await AsyncStorage.setItem('completedWorkouts', String(completedCount + 1));

   const firstTime = await AsyncStorage.getItem('firstWorkoutTimestamp');
   if (!firstTime) {
     await AsyncStorage.setItem('firstWorkoutTimestamp', String(Date.now()));
   }
   ```

### Fonts not loading

**Check:**
1. `@expo-google-fonts/inter` is installed
2. Fonts are loaded before rendering app
3. Using `getFontFamily` hook from module

**Example font loading:**
```tsx
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return <PaywallProvider ...>...</PaywallProvider>;
}
```

## Migration from Tabata Timer

If you're migrating from the Tabata Timer app:

1. **Copy the module** into your new project
2. **Install dependencies** (see Installation section)
3. **Configure PaywallConfig** with your RevenueCat keys
4. **Wrap app in PaywallProvider** (instead of using paywall hooks directly)
5. **Update imports** from `./hooks/usePaywallGate` to `./paywall-module`

**Before:**
```tsx
import { usePaywallGate } from './hooks/usePaywallGate';
import { useRevenueCat } from './hooks/useRevenueCat';
import Paywall from './components/Paywall';
```

**After:**
```tsx
import { PaywallProvider, usePaywallGate, useRevenueCat, Paywall } from './paywall-module';
```

## License

MIT

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Credits

Extracted and refactored from the Tabata Timer app.
