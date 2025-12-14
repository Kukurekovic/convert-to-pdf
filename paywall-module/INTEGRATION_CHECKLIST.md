# Integration Checklist

Use this checklist when integrating the paywall module into a new project.

## Pre-Integration Setup

- [ ] Create RevenueCat account at [revenuecat.com](https://www.revenuecat.com/)
- [ ] Create new app in RevenueCat dashboard
- [ ] Get iOS API key from RevenueCat
- [ ] Get Android API key from RevenueCat
- [ ] Create entitlement (e.g., "premium") in RevenueCat
- [ ] Set up subscription products in RevenueCat
- [ ] Link RevenueCat products to App Store Connect / Google Play Console products
- [ ] Test products in sandbox mode

## Installation

- [ ] Copy `paywall-module/` folder to your project root
- [ ] Install dependencies:
  ```bash
  npm install react-native-purchases @react-native-async-storage/async-storage i18n-js expo-localization @expo/vector-icons react-native-reanimated @expo-google-fonts/inter nativewind
  ```
- [ ] If using Expo, run `npx expo install` to ensure compatible versions

## Configuration

- [ ] Create paywall config object in your `App.tsx`:
  - [ ] Add iOS API key
  - [ ] Add Android API key
  - [ ] Set entitlement ID (must match RevenueCat)
  - [ ] Set privacy policy URL
  - [ ] Configure trial settings (optional)
- [ ] Create translations object with required keys (see `README.md`)
- [ ] (Optional) Create custom theme object

## Integration

- [ ] Wrap your app in `<PaywallProvider>`:
  ```tsx
  <PaywallProvider config={...} translations={...}>
    <YourApp />
  </PaywallProvider>
  ```
- [ ] Use `usePaywallGate()` hook in your app content
- [ ] Use `useRevenueCat()` hook for subscribe/restore functions
- [ ] Add `<Paywall />` component to your app
- [ ] (Optional) Add `<UpgradeModal />` for feature gating
- [ ] (Optional) Add `<TrialLimitModal />` for trial limits

## Feature Gating

- [ ] Identify premium features in your app
- [ ] Add `if (!isSubscriber)` checks before premium features
- [ ] Show `UpgradeModal` when user tries premium feature
- [ ] Implement trial limit logic with `ensureGateBeforeStart()`

## Testing

### Development Testing

- [ ] Test paywall display on iOS simulator
- [ ] Test paywall display on Android emulator
- [ ] Test subscription purchase flow (sandbox mode)
- [ ] Test restore purchases
- [ ] Test trial limits (if enabled)
- [ ] Test feature gating
- [ ] Test different screen sizes (phone vs tablet)
- [ ] Test custom theme (if configured)
- [ ] Test translations (multiple languages if configured)

### Production Testing

- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Verify production API keys are used
- [ ] Verify products are live in App Store / Play Store
- [ ] Test actual purchase flow (use test account)
- [ ] Test subscription status persistence
- [ ] Test restore purchases with real receipts

## Common Issues to Check

- [ ] RevenueCat logs show successful configuration:
  ```
  [PaywallModule] RevenueCat configured successfully for iOS/Android
  ```
- [ ] Offerings loaded successfully:
  ```
  [PaywallModule] 📦 Available Offerings: ...
  [PaywallModule] 📋 Available Packages: ...
  ```
- [ ] Fonts loaded before rendering paywall
- [ ] Privacy policy URL is accessible
- [ ] All required translation keys are present
- [ ] AsyncStorage permissions granted (if needed)

## Production Deployment

- [ ] Update `package.json` name and version
- [ ] Remove console.log statements (or configure log level to 'WARN')
- [ ] Test on production RevenueCat environment
- [ ] Verify App Store Connect / Google Play Console setup
- [ ] Test purchase flow with production products
- [ ] Monitor RevenueCat dashboard for events
- [ ] Set up webhooks (optional)

## Documentation

- [ ] Document your RevenueCat setup in project README
- [ ] Document subscription product IDs
- [ ] Document entitlement IDs used
- [ ] Document trial limits configured
- [ ] Document any custom modifications to paywall module

## Optional Enhancements

- [ ] Add analytics tracking for paywall views/purchases
- [ ] Add custom gift image
- [ ] Implement onboarding flow before paywall
- [ ] Add more languages
- [ ] Customize trial message for your use case
- [ ] Add promotional offers
- [ ] Implement introductory pricing

## Maintenance

- [ ] Regularly check RevenueCat dashboard for metrics
- [ ] Monitor subscription renewal rates
- [ ] Update products/pricing as needed
- [ ] Keep `react-native-purchases` package up to date
- [ ] Test after major OS updates (iOS/Android)

---

## Quick Reference

**Required Config Keys:**
- `revenueCat.iosApiKey`
- `revenueCat.androidApiKey`
- `revenueCat.entitlementId`
- `links.privacyPolicy`

**Required Translation Keys:**
- `paywall.*` (all paywall translations)
- `upgrade.*` (upgrade modal translations)
- `trialLimit.*` (trial limit modal translations)

**Required Dependencies:**
- `react-native-purchases`
- `@react-native-async-storage/async-storage`
- `i18n-js`
- `expo-localization`
- `@expo/vector-icons`
- `react-native-reanimated`
- `@expo-google-fonts/inter`
- `nativewind`

For detailed documentation, see `README.md`.
For integration example, see `INTEGRATION_EXAMPLE.tsx`.
