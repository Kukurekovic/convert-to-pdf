# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native Expo app for converting files to PDF. The app uses Expo Dev Client for native development and includes:
- **React Native** 0.81.5
- **Expo SDK** 54
- **React Navigation** with bottom tabs
- **NativeWind v2** for styling (Tailwind CSS 3.3.2)

## Development Commands

### Start Development Server
```bash
npx expo start --dev-client
```
After Metro bundler starts, press `i` for iOS or `a` for Android.

### Build and Run on iOS
```bash
npm run ios
# or with locale fix for CocoaPods:
LANG=en_US.UTF-8 npx expo run:ios
```

### Build and Run on Android
```bash
npm run android
```

### Clear Metro Cache
```bash
npx expo start --clear --dev-client
```

### Install iOS Dependencies (CocoaPods)
```bash
LANG=en_US.UTF-8 pod install
```
Note: The `LANG=en_US.UTF-8` prefix is required to avoid Unicode normalization errors with CocoaPods.

## Project Structure

```
.
├── App.js                  # Root component with navigation setup
├── screens/
│   ├── ConvertScreen.js    # Main screen with 6 conversion source buttons
│   ├── HistoryScreen.js    # Conversion history
│   └── SettingsScreen.js   # App settings
├── app.json                # Expo configuration
├── babel.config.js         # Babel with NativeWind plugin
└── tailwind.config.js      # Tailwind CSS configuration
```

## Architecture

### Navigation
The app uses React Navigation with bottom tabs configured in [App.js](App.js):
- **Convert** (default) - File conversion interface
- **History** - Past conversions
- **Settings** - App preferences

Tab bar colors:
- Active: `#3b82f6` (blue-500)
- Inactive: `#9ca3af` (gray-400)

### Styling Approach
The app uses **React Native StyleSheet** for most styling rather than NativeWind classes. This is because NativeWind v2 has limited support for certain Tailwind classes in React Native.

**Important**: When adding new components:
- Use `StyleSheet.create()` for layouts and colors
- Inline styles work well for one-off color variations
- NativeWind classes work for basic utilities (flex-1, padding, etc.) but not for colors or complex layouts
- Always use `SafeAreaView` from `react-native-safe-area-context` for proper iOS safe area handling

### Convert Screen Pattern
[ConvertScreen.js](screens/ConvertScreen.js) demonstrates the recommended pattern:
- 6 large touchable buttons in a 2x3 grid
- Each button uses `TouchableOpacity` with inline `backgroundColor`
- Rows use `flexDirection: 'row'` with `flex: 1` on buttons for equal width
- Each button is 120px tall with 16px border radius

## iOS-Specific Notes

1. **Bundle Identifier**: `com.converttopdf.app` (set in [app.json](app.json))
2. **Safe Areas**: Always wrap screens with `SafeAreaView` from `react-native-safe-area-context`
3. **CocoaPods Locale**: Set `LANG=en_US.UTF-8` before running `pod install` or iOS builds

## Android-Specific Notes

1. **Package Name**: `com.converttopdf.app` (set in [app.json](app.json))

## Known Compatibility Issues

- **NativeWind v4**: Not compatible with current Expo SDK 54 + React Native 0.81.5 setup. Use v2 instead.
- **React Native Reanimated**: Removed due to version conflicts. Re-add only if needed for animations.
- **Metro Bundler**: If changes don't appear, always clear cache with `--clear` flag

## Babel Configuration

The [babel.config.js](babel.config.js) includes the NativeWind plugin:
```javascript
plugins: ['nativewind/babel']
```
This is required for NativeWind v2. Do not remove.
