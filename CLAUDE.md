# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native Expo app for converting files to PDF. The app uses Expo Dev Client for native development and includes:
- **React Native** 0.81.5
- **Expo SDK** 54
- **React Navigation** with bottom tabs
- **NativeWind v2** for styling (Tailwind CSS 3.3.2)

The project uses a custom **responsive layout system** located in:

- `utils/responsive.js`
- `theme/theme.js`

Claude Code **must always use these utilities** for sizing, spacing, fonts, colors, and layout-related values.

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
├── App.js
├── screens/
│   ├── ConvertScreen.js
│   ├── HistoryScreen.js
│   └── SettingsScreen.js
├── utils/
│   └── responsive.js
├── theme/
│   └── theme.js
├── app.json
├── babel.config.js
└── tailwind.config.js

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

### Responsive Design & Theming Rules
(MANDATORY FOR CLAUDE CODE)

All UI development must use:

utils/responsive.js
theme/theme.js

UI Element Type → Recommended Unit
UI Element Type	Unit / Helper
Overall Layout	flex, plus wp(), hp() only when needed
Width / Height	wp(), hp()
Fonts	RF()
Padding / Margin	RS()
Border Radius	RS()
Icons	RS()
Images	imgSize() or wp()
General Spacing	RS()

Claude Code must:
Never hard-code pixel values (width: 40, padding: 12, etc.)
Never use Tailwind for spacing/sizing/fonts/colors

Always import:
import { wp, hp, RF, RS, imgSize } from '../utils/responsive';
import { theme } from '../theme/theme';

Colors, spacing, typography must come from theme.js.

### Styling Approach
Primary styling method: React Native StyleSheet

NativeWind v2 allowed only for:
flex utilities (flex-1, items-center, etc.)
basic layout helpers

Do not use Tailwind spacing/colors
Always wrap screens with SafeAreaView from react-native-safe-area-context

### Convert Screen Pattern
[ConvertScreen.js](screens/ConvertScreen.js) demonstrates the recommended pattern:
6 large buttons (2 × 3 grid)
Button layout/sizes:
height with hp()
spacing & radius with RS()
icon with RS()

Colors must come from theme.js

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
