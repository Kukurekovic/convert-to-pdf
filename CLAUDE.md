# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **TypeScript** React Native Expo app for converting files to PDF. The app uses Expo Dev Client for native development and includes:
- **React Native** 0.81.5
- **Expo SDK** 54
- **TypeScript** with strict mode enabled
- **React Navigation** with bottom tabs
- **NativeWind v2** for styling (Tailwind CSS 3.3.2)
- **Zustand** for state management

The project uses a custom **responsive layout system** located in:

- `utils/responsive.ts`
- `theme/theme.ts`

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

### TypeScript Type Checking
```bash
npm run type-check
# or with watch mode:
npm run type-check:watch
```

### Install iOS Dependencies (CocoaPods)
```bash
LANG=en_US.UTF-8 pod install
```
Note: The `LANG=en_US.UTF-8` prefix is required to avoid Unicode normalization errors with CocoaPods.

## Project Structure

```
.
├── App.tsx
├── screens/
│   ├── ConvertScreen.tsx
│   ├── HistoryScreen.tsx
│   └── SettingsScreen.tsx
├── components/
│   ├── CameraView.tsx
│   ├── ImageEditor.tsx
│   └── PDFPreview.tsx
├── store/
│   └── useDocumentStore.ts
├── utils/
│   ├── responsive.ts
│   ├── pdfUtils.ts
│   └── imageUtils.ts
├── theme/
│   └── theme.ts
├── types/
│   ├── document.ts
│   ├── store.ts
│   ├── navigation.ts
│   ├── responsive.ts
│   ├── theme.ts
│   ├── react-native-document-scanner-plugin.d.ts
│   └── index.ts
├── tsconfig.json
├── app.json
├── babel.config.js
└── tailwind.config.js
```

## Architecture

### Navigation
The app uses React Navigation with bottom tabs configured in [App.tsx](App.tsx):
- **Convert** (default) - File conversion interface
- **History** - Past conversions
- **Settings** - App preferences

Tab bar colors:
- Active: `#3b82f6` (blue-500)
- Inactive: `#9ca3af` (gray-400)

Navigation types are defined in [types/navigation.ts](types/navigation.ts).

### Responsive Design & Theming Rules
(MANDATORY FOR CLAUDE CODE)

All UI development must use:

- [utils/responsive.ts](utils/responsive.ts)
- [theme/theme.ts](theme/theme.ts)

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
- Never hard-code pixel values (width: 40, padding: 12, etc.)
- Never use Tailwind for spacing/sizing/fonts/colors
- Always use TypeScript with proper type imports

Always import:
```typescript
import { wp, hp, RF, RS, imgSize } from '../utils/responsive';
import { theme } from '../theme/theme';
```

Colors, spacing, typography must come from theme.ts.
Types must be imported from the `types/` directory.

### Styling Approach
Primary styling method: React Native StyleSheet

NativeWind v2 allowed only for:
flex utilities (flex-1, items-center, etc.)
basic layout helpers

Do not use Tailwind spacing/colors
Always wrap screens with SafeAreaView from react-native-safe-area-context

### Convert Screen Pattern
[ConvertScreen.tsx](screens/ConvertScreen.tsx) demonstrates the recommended pattern:
6 large buttons (2 × 3 grid)
Button layout/sizes:
- height with hp()
- spacing & radius with RS()
- icon with RS()

Colors must come from theme.ts

## TypeScript

### Configuration
- **Strict mode enabled**: All strict TypeScript compiler options are active
- **Config file**: [tsconfig.json](tsconfig.json) extends `expo/tsconfig.base`
- **Type definitions**: All types are located in the `types/` directory

### Type Organization
- **Core types**: [types/document.ts](types/document.ts) - ImageAsset, PDFDocument, FilterType, etc.
- **Store types**: [types/store.ts](types/store.ts) - Zustand state interface
- **Navigation types**: [types/navigation.ts](types/navigation.ts) - React Navigation props
- **Utility types**: [types/responsive.ts](types/responsive.ts), [types/theme.ts](types/theme.ts)
- **Custom declarations**: [types/react-native-document-scanner-plugin.d.ts](types/react-native-document-scanner-plugin.d.ts)

### Component Pattern
All React components must follow this pattern:
```typescript
import type { ComponentProps } from '../types/componentName';

interface ComponentProps {
  onAction: (data: DataType) => void;
  onClose: () => void;
}

const Component: React.FC<ComponentProps> = ({ onAction, onClose }) => {
  const [state, setState] = useState<Type>(initialValue);

  const handleAction = async (): Promise<void> => {
    // implementation
  };

  return (/* JSX */);
};

export default Component;
```

### Key TypeScript Patterns Used
- Nullish coalescing for optional properties: `value ?? fallback`
- Non-null assertions for safe array access: `array[i]!`
- Explicit async return types: `async (): Promise<void> => {}`
- Type guards for FileSystem API: `info.exists && 'size' in info ? info.size : 0`

## PDF Generation

### Image Embedding
**CRITICAL**: Images must be converted to base64 before PDF generation.

The PDF generator in [utils/pdfUtils.ts](utils/pdfUtils.ts) uses this pattern:
```typescript
// Convert images to base64 for embedding in HTML
const imageDataPromises = images.map(async (img) => {
  const base64 = await FileSystem.readAsStringAsync(img.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:image/jpeg;base64,${base64}`;
});

const imageData = await Promise.all(imageDataPromises);
```

**Why**: Local file URIs (`file:///...`) cannot be used directly in HTML for PDF generation. They must be embedded as base64 data URIs to render correctly in the generated PDF.

**Do not**: Use `img.uri` directly in HTML `<img src="${img.uri}">` - this will show broken images/question marks.

## State Management

### Zustand Store
Global state is managed with Zustand in [store/useDocumentStore.ts](store/useDocumentStore.ts).

The store is typed with the `DocumentStoreState` interface from [types/store.ts](types/store.ts):
```typescript
import { create } from 'zustand';
import type { DocumentStoreState } from '../types/store';

const useDocumentStore = create<DocumentStoreState>((set, get) => ({
  // state and actions
}));
```

**Store sections**:
- **Images**: Current session images for PDF generation
- **PDFs**: Saved PDF documents with metadata
- **Settings**: App preferences (autoEnhance, defaultQuality, showTutorial)

**Key actions**:
- `addImage`, `removeImage`, `updateImage`, `clearImages`
- `addPDF`, `removePDF`, `clearAllPDFs`, `loadPDFs`
- `updateSettings`

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
