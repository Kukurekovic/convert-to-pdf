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

**Note**: `CameraView.tsx` component has been removed. The app no longer includes a camera feature.

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
[ConvertScreen.tsx](screens/ConvertScreen.tsx) demonstrates the recommended pattern with multiple input methods organized in rows of 2 buttons each.

**Button Grid Layout** (6 buttons total):
- Row 1: **Files** (blue) + **Gallery** (purple)
- Row 2: **Scan Doc** (green) + **Cloud** (cyan)
- Row 3: **URL Link** (orange) + **Other Apps** (red)

Button styling requirements:
- height with `hp()` or `RS()`
- spacing & radius with `RS()`
- icon with `RS()`
- colors must come from `theme.ts` or use hex values for specific branding

**Input Methods**:
1. **Files** - Uses `expo-document-picker` to select images from device file system
2. **Gallery** - Uses `expo-image-picker` to select from photo library
3. **Scan Doc** - Uses `react-native-document-scanner-plugin` for document scanning
4. **Cloud** - Uses `expo-document-picker` to access cloud storage services (iCloud Drive, Google Drive, Microsoft OneDrive, Dropbox)
5. **URL Link** - Downloads images from URLs using `expo-file-system` (`File.downloadFileAsync()`)
6. **Other Apps** - Shows instructional modal about share sheet (informational only)

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

### Orientation-Aware PDF Generation
The app implements **automatic page orientation matching** where each PDF page rotates to match its image orientation (portrait/landscape). This prevents image cropping while filling entire pages.

**Implementation** ([utils/pdfUtils.ts](utils/pdfUtils.ts)):
- Uses CSS `@page` named pages (`@page portrait` and `@page landscape`) with different A4 dimensions
- Portrait pages: 595px × 842px (8.27" × 11.69" at 72 DPI)
- Landscape pages: 842px × 595px (297mm × 210mm at 72 DPI)
- Images use `object-fit: contain` to preserve aspect ratio without cropping
- Orientation detected via `detectOrientation(width, height)` helper (width > height = landscape)

### Image Dimension Detection
All images must have dimensions before PDF generation. The app handles four image sources:

1. **Gallery** ([screens/ConvertScreen.tsx](screens/ConvertScreen.tsx)): Provides dimensions via `expo-image-picker`
2. **Files** ([screens/ConvertScreen.tsx](screens/ConvertScreen.tsx)): Uses `getImageDimensions()` from `expo-document-picker` results
3. **Document Scanner** ([screens/ConvertScreen.tsx](screens/ConvertScreen.tsx)): Uses `getImageDimensions()` to detect dimensions
4. **URL Download** ([screens/ConvertScreen.tsx](screens/ConvertScreen.tsx)): Uses `getImageDimensions()` after downloading with `File.downloadFileAsync()`

**Dimension Detection Utility** ([utils/imageUtils.ts](utils/imageUtils.ts)):
```typescript
export const getImageDimensions = async (uri: string): Promise<{ width: number; height: number }> => {
  const result = await ImageManipulator.manipulateAsync(uri, [], {
    compress: 1,
    format: ImageManipulator.SaveFormat.JPEG
  });
  return { width: result.width, height: result.height };
};
```

**Why**: `expo-image-manipulator` returns dimensions even with empty actions array. This works for all image sources including document scanner images that lack metadata.

### Image Embedding
**CRITICAL**: Images must be converted to base64 before PDF generation.

The PDF generator processes images with orientation detection:
```typescript
const processedImages = await Promise.all(
  images.map(img => getImageOrientation(img))
);
// Returns: { base64Data: string, orientation: 'portrait' | 'landscape' }
```

**Why**: Local file URIs (`file:///...`) cannot be used directly in HTML for PDF generation. They must be embedded as base64 data URIs to render correctly in the generated PDF.

**Do not**: Use `img.uri` directly in HTML `<img src="${img.uri}">` - this will show broken images/question marks.

### PDF Generation Behavior
- **Portrait images** → Portrait PDF pages (595 × 842 px)
- **Landscape images** → Landscape PDF pages (842 × 595 px)
- **No cropping**: Full image content preserved via `object-fit: contain`
- **Minimal white space**: Pages sized to match image orientation
- **Fallback**: If dimensions unavailable, defaults to portrait A4 (595 × 842)

### PDF Naming Convention
PDFs are automatically named with a human-readable timestamp format to help users identify when documents were created.

**Filename Format**: `Doc [Month] [Day], [Year] [Hour]:[Minute]:[Second]`
- Example: `Doc Nov 29, 2025 18:02:45`

**Implementation** ([utils/pdfUtils.ts](utils/pdfUtils.ts)):
- Uses `generateDefaultFileName()` helper function
- Includes seconds to ensure uniqueness when multiple PDFs are created quickly
- Format matches the date display in HistoryScreen for consistency

**Date Display Format**: The `formatDate()` function displays dates as `Nov 29, 2025` throughout the app for consistency with filenames.

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

**Important**: When loading PDFs from storage in `loadPDFs()`, the `modificationTime` from FileSystem is in **seconds** and must be converted to milliseconds by multiplying by 1000 before storing in `createdAt` (which expects milliseconds like `Date.now()`).

## iOS-Specific Notes

1. **Bundle Identifier**: `com.converttopdf.app` (set in [app.json](app.json))
2. **Safe Areas**: Always wrap screens with `SafeAreaView` from `react-native-safe-area-context`
3. **CocoaPods Locale**: Set `LANG=en_US.UTF-8` before running `pod install` or iOS builds

## Android-Specific Notes

1. **Package Name**: `com.converttopdf.app` (set in [app.json](app.json))
2. **SDK Configuration**: The `android/local.properties` file is required and contains the Android SDK path:
   ```properties
   sdk.dir=/Users/markokukurekovic/Library/Android/sdk
   ```
   - This file is machine-specific and is excluded from version control via [.gitignore](.gitignore)
   - Common SDK location on macOS: `~/Library/Android/sdk`
   - If missing, builds will fail with "SDK location not found" error
3. **USB Installation**: When installing via USB (`npx expo run:android --device`), ensure device settings allow USB installation:
   - Enable **"Install via USB"** in Developer Options
   - Enable **"USB debugging (Security settings)"** if available
   - Some manufacturers (Xiaomi/MIUI, Samsung) require additional security permissions

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

## File System API

The app uses the **modern expo-file-system API** (Expo SDK 54+):

### Imports
```typescript
import { File, Paths } from 'expo-file-system';
```

### Key Changes from Legacy API
- **Use `Paths.cache`** instead of `FileSystem.cacheDirectory`
- **Use `Paths.document`** instead of `FileSystem.documentDirectory`
- **Use `File.downloadFileAsync(url, destination)`** instead of `FileSystem.downloadAsync()`
- The new API uses `Paths.cache` (Directory object) as destination, not string URIs

### Example: Downloading Files
```typescript
const downloadedFile = await File.downloadFileAsync(url, Paths.cache);
// Returns a File object with .uri property
const imageUri = downloadedFile.uri;
```

**Do not use**:
- `FileSystem.downloadAsync()` (legacy, deprecated)
- `FileSystem.cacheDirectory` (string-based, old API)

## Image Import Methods

### Files Button (Document Picker)
Uses `expo-document-picker` for accessing files from anywhere on the device:
```typescript
const result = await DocumentPicker.getDocumentAsync({
  type: 'image/*',
  multiple: true,
  copyToCacheDirectory: true,
});
```

**Why expo-document-picker?** Provides access to:
- Files app on iOS
- Downloads folder
- Cloud storage providers (Google Drive, Dropbox, etc.)
- Any file location accessible to the system

**Difference from Gallery**: Gallery (`expo-image-picker`) only accesses the photo library, while Files accesses the entire file system.

### URL Download
Downloads images from URLs and adds them to the conversion queue:
- Validates URL format (must start with `http://` or `https://`)
- Downloads using `File.downloadFileAsync()` to cache directory
- Detects dimensions using `getImageDimensions()`
- Provides success/error feedback via alerts

### Other Apps (Share Sheet)
Currently **informational only** - shows a modal with instructions on how to share files from other apps. Does not implement actual share extension functionality (would require native configuration).
