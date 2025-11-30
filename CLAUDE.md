# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **TypeScript** React Native Expo app for converting files to PDF. The app uses Expo Dev Client for native development and includes:
- **React Native** 0.81.5
- **Expo SDK** 54
- **TypeScript** with strict mode enabled
- **React Navigation** with bottom tabs and native stack navigation
- **@react-navigation/native-stack** for stack navigation within tabs
- **NativeWind v2** for styling (Tailwind CSS 3.3.2)
- **Zustand** for state management
- **@expo/vector-icons** for Material Icons

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
│   ├── PDFDetailScreen.tsx
│   └── SettingsScreen.tsx
├── components/
│   ├── ImageEditor.tsx
│   ├── ImagePreviewPanel.tsx
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
The app uses a **hybrid navigation structure** combining bottom tabs with native stack navigation:

**Tab Navigator** (Root level - [App.tsx](App.tsx)):
- **Convert** - File conversion interface
- **HistoryStack** - History tab with nested stack navigation
- **Settings** - App preferences

**History Stack Navigator** (Nested within History tab):
- **HistoryList** - List of saved PDFs with chevron icons indicating navigation
- **PDFDetail** - Full-screen PDF detail view with slide-from-right animation

**Navigation Configuration**:
- Tab bar colors: Active `#3b82f6` (blue-500), Inactive `#9ca3af` (gray-400)
- Tab bar icons (Material Icons): `picture-as-pdf`, `history`, `settings`
- Stack animation: `slide_from_right` for PDFDetail screen
- Headers: Hidden for all screens (custom headers in components)

**Navigation Types** ([types/navigation.ts](types/navigation.ts)):
- `RootTabParamList` - Bottom tab navigator params
- `HistoryStackParamList` - History stack params with `pdfId` parameter for PDFDetail
- `HistoryListScreenProps` - Composite props for HistoryScreen (stack + tab)
- `PDFDetailScreenProps` - Composite props for PDFDetailScreen (stack + tab)

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

**Screen Layout**:
- **Title**: "Convert to PDF" - center-aligned (`textAlign: 'center'`)
- **Button Grid**: 6 buttons in 3 rows of 2

**Button Grid Layout** (6 buttons total):
- Row 1: **Files** (blue) + **Gallery** (purple)
- Row 2: **Scan Doc** (green) + **Cloud** (cyan)
- Row 3: **URL Link** (orange) + **Other Apps** (red)

**Icon System**:
All buttons use Material Icons from `@expo/vector-icons` package:
- **Files**: `folder` icon
- **Gallery**: `collections` icon
- **Scan Doc**: `document-scanner` icon
- **Cloud**: `cloud` icon
- **URL Link**: `link` icon
- **Other Apps**: `apps` icon

Button styling requirements:
- height with `hp()` or `RS()`
- spacing & radius with `RS()`
- icon size with `RS()` (e.g., `size={RS(48)}`)
- icon spacing: `marginBottom: RS(8)`
- colors must come from `theme.ts` or use hex values for specific branding

**Input Methods**:
1. **Files** - Uses `expo-document-picker` to select images from device file system
2. **Gallery** - Uses `expo-image-picker` to select from photo library
3. **Scan Doc** - Uses `react-native-document-scanner-plugin` for document scanning
4. **Cloud** - Uses `expo-document-picker` to access cloud storage services (iCloud Drive, Google Drive, Microsoft OneDrive, Dropbox)
5. **URL Link** - Downloads images from URLs using `expo-file-system` (`File.downloadFileAsync()`)
6. **Other Apps** - Shows instructional modal about share sheet (informational only)

### History Screen Pattern
[HistoryScreen.tsx](screens/HistoryScreen.tsx) displays a list of saved PDFs with navigation to detail view:

**UI Elements**:
- **Header**: "History" title with "Clear All" button (right-aligned, red text)
- **PDF List Items**: Tappable cards with:
  - Thumbnail image (50x60px, rounded) or blue PDF icon fallback (left side)
  - File details (name, size, date, page count)
  - Chevron-right icon (gray, right side) indicating navigation
- **Empty State**: Shows when no PDFs exist with icon, title, and message
- **Loading State**: ActivityIndicator while loading PDFs from storage

**Interaction**:
- Tap on any PDF item → Navigate to PDFDetail screen with slide-from-right animation
- "Clear All" button → Confirmation alert → Delete all PDFs (and thumbnails)

**Thumbnail Display**:
- Shows thumbnail preview when `pdf.thumbnail` exists (newly created PDFs)
- Falls back to blue "PDF" icon badge for PDFs without thumbnails (old PDFs)
- Thumbnail style: 50x60px, `cover` resize mode, rounded corners

**Removed Features** (as of current version):
- Share button (removed from list items)
- Delete button (removed from list items)
- These actions now only available in PDFDetailScreen

### PDF Detail Screen Pattern
[PDFDetailScreen.tsx](screens/PDFDetailScreen.tsx) shows full PDF preview with minimal UI:

**Screen Layout**:
1. **Header**: Back button (left), PDF filename (center), placeholder (right)
2. **PDF Preview**: Large thumbnail image preview (if available) or "No preview available" fallback
3. **Footer**: Share and Delete action buttons

**Features**:
- **Preview**: Displays `pdf.thumbnail` as large preview image with `contain` resize mode
- **Fallback**: Shows PDF icon with "No preview available" message when thumbnail is missing
- **Navigation**: Back button calls `navigation.goBack()`
- **Share**: Uses `sharePDF()` utility, shows loading spinner during share
- **Delete**: Confirmation alert → Delete PDF (and thumbnail) → Navigate back to list
- **Error Handling**: If PDF not found, shows alert and navigates back

**Styling**:
- Preview image: Full width minus padding (SCREEN_WIDTH - RS(64)), aspect ratio 1:1.4 (portrait)
- Preview container: White background, rounded corners, medium shadow
- Fallback container: Centered PDF icon (64pt) with gray text
- Footer buttons: Share (blue) and Delete (white with red border/text)

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

## Image Preview Panel

### Overview
[components/ImagePreviewPanel.tsx](components/ImagePreviewPanel.tsx) is a full-screen slide-in panel that appears when users add images to the conversion queue. It replaces the inline preview that previously appeared in ConvertScreen.

### Behavior
- **Trigger**: Opens automatically when images are added via any import method (Files, Gallery, Scan, Cloud, URL)
- **Animation**: Slides in from right to left (300ms), slides out left to right (250ms)
- **Panel Width**: 100% (full screen)
- **Modal**: Uses React Native Modal with transparent overlay

### Features
1. **Document Name Input**: TextInput field with auto-generated default filename
   - Format: `Doc [Month] [Day], [Year] [Hour]:[Minute]:[Second]`
   - Example: `Doc Nov 30, 2025 14:30:45`
   - User can edit before generating PDF

2. **PDF Quality Selector**: Four quality options with visual active state
   - Low (0.3), Medium (0.6), High (0.8), Best (1.0)
   - Default: High (0.8)
   - Font size: `RF(12)` (smaller than surrounding text)

3. **Image Preview Grid**: Horizontal scrollable view
   - Thumbnail size: `RS(80)` × `RS(100)`
   - Shows image numbers (1, 2, 3...)
   - Tap to edit individual images

4. **Add More Images**: Two buttons to add additional images
   - Scan button (green #22c55e)
   - Gallery button (purple #a855f7)

5. **Clear All**: Button to remove all images from queue

6. **Generate PDF**: Fixed footer button to proceed to PDF generation

### Header
- **Back Button**: "← Back" text button (not X icon)
  - Color: `theme.colors.primary`
  - Font size: `RF(16)`
  - Weight: 600
- **Title**: "PDF Preview"

### State Management
The panel uses a `previousVisible` state pattern to ensure the default filename is generated only when the panel **transitions from hidden to visible**, not on every re-render. This prevents the filename from being reset while the user is editing it.

```typescript
const [previousVisible, setPreviousVisible] = useState(false);

useEffect(() => {
  if (visible && !previousVisible) {
    // Generate default filename only on panel open
    setFilename(generateDefaultFilename());
  }
  setPreviousVisible(visible);
}, [visible, previousVisible]);
```

### Data Flow
1. User adds images → ConvertScreen calls `setShowPreviewPanel(true)`
2. User edits filename and selects quality in ImagePreviewPanel
3. User clicks "Generate PDF" → `onGeneratePDF(filename.trim(), selectedQuality)` called
4. ConvertScreen stores values in `pdfFilename` and `pdfQuality` state
5. ConvertScreen opens PDFPreview with these props
6. PDFPreview maps numeric quality to string ('low', 'medium', 'high')
7. PDFPreview calls `generatePDF(images, { fileName, quality })`
8. PDF is generated with user's custom filename and quality

### Quality Mapping
ImagePreviewPanel uses numeric quality values (0.3, 0.6, 0.8, 1.0), but `generatePDF` expects string values ('low', 'medium', 'high'). PDFPreview handles this mapping:

```typescript
const getQualityString = (numericQuality: number): 'low' | 'medium' | 'high' => {
  if (numericQuality <= 0.3) return 'low';
  if (numericQuality <= 0.6) return 'medium';
  return 'high';
};
```

### PDFPreview Props
PDFPreview now accepts optional `filename` and `quality` props:

```typescript
interface PDFPreviewProps {
  images: ImageAsset[];
  onClose: () => void;
  onEdit: (index: number) => void;
  filename?: string;  // Custom filename from user
  quality?: number;   // Numeric quality (0.3-1.0)
}
```

These props are passed from ConvertScreen and used in PDF generation instead of hardcoded values.

## PDF Thumbnail Generation

The app implements **automatic thumbnail generation** for all newly created PDFs. Thumbnails are displayed in both the History list and PDF Detail screen.

### Implementation Overview

**Approach**: Hybrid solution that saves the first processed image (already converted to base64 with orientation corrections) as a thumbnail file during PDF generation.

**Why this approach?**
- No additional dependencies required (uses existing `expo-image-manipulator` and `expo-file-system`)
- Thumbnail accurately represents final PDF appearance (includes orientation corrections)
- Efficient - reuses existing image processing pipeline
- Lightweight - avoids heavy PDF-to-image extraction libraries

### Thumbnail Specifications

- **Format**: JPEG at 0.7 compression
- **Size**: Resized to 800px max width (preserves aspect ratio)
- **File size**: ~60-80KB per thumbnail
- **Naming**: `{filename}_thumb.jpg` (stored alongside PDF in `pdfs/` directory)
- **Storage location**: `{documentDirectory}/pdfs/{filename}_thumb.jpg`

### Core Implementation

**1. Thumbnail Generation Utility** ([utils/imageUtils.ts](utils/imageUtils.ts:150-199))

```typescript
export const generateThumbnail = async (
  base64Data: string,
  fileName: string
): Promise<string> => {
  // Remove data URI prefix if present
  const base64Only = base64Data.includes(',')
    ? base64Data.split(',')[1]!
    : base64Data;

  // Create temporary file from base64
  const tempUri = `${FileSystem.cacheDirectory ?? ''}temp_${Date.now()}.jpg`;
  await FileSystem.writeAsStringAsync(tempUri, base64Only, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Resize to 800px width, compress to JPEG 0.7
  const result = await ImageManipulator.manipulateAsync(
    tempUri,
    [{ resize: { width: 800 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  // Move to final location in pdfs directory
  const pdfsDir = `${FileSystem.documentDirectory ?? ''}pdfs/`;
  const thumbnailUri = `${pdfsDir}${fileName}_thumb.jpg`;
  await FileSystem.moveAsync({ from: result.uri, to: thumbnailUri });

  return thumbnailUri;
};
```

**2. PDF Generation Integration** ([utils/pdfUtils.ts](utils/pdfUtils.ts:207-230))

After PDF is created, thumbnail is generated from first processed image:

```typescript
// Generate thumbnail from first processed image
let thumbnailUri: string | null = null;
try {
  if (processedImages.length > 0 && processedImages[0]) {
    thumbnailUri = await generateThumbnail(
      processedImages[0].base64Data,
      fileName
    );
  }
} catch (error) {
  console.error('Error generating thumbnail:', error);
  // Don't fail PDF generation if thumbnail creation fails
  thumbnailUri = null;
}

return {
  id: fileName,
  name: fileName,
  uri: finalUri,
  size: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
  createdAt: Date.now(),
  pageCount: images.length,
  thumbnail: thumbnailUri,  // Include thumbnail URI
};
```

**3. Loading Thumbnails from Storage** ([store/useDocumentStore.ts](store/useDocumentStore.ts:103-116))

When loading PDFs from disk, the store checks for corresponding thumbnail files:

```typescript
const pdfs = await Promise.all(
  pdfFiles.map(async (filename): Promise<PDFDocument> => {
    const uri = `${documentsDir}${filename}`;
    const info = await FileSystem.getInfoAsync(uri);

    // Check for thumbnail file
    const baseFilename = filename.replace('.pdf', '');
    const thumbnailUri = `${documentsDir}${baseFilename}_thumb.jpg`;
    const thumbnailInfo = await FileSystem.getInfoAsync(thumbnailUri);
    const thumbnail = thumbnailInfo.exists ? thumbnailUri : null;

    return {
      id: baseFilename,
      name: baseFilename,
      uri,
      size: info.exists && 'size' in info ? info.size : 0,
      createdAt: info.exists && 'modificationTime' in info ? info.modificationTime * 1000 : Date.now(),
      thumbnail,
    };
  })
);
```

### UI Display Patterns

**PDFDetailScreen** ([screens/PDFDetailScreen.tsx](screens/PDFDetailScreen.tsx:106-119))

Displays large thumbnail preview or graceful fallback:

```typescript
{pdf.thumbnail ? (
  <View style={styles.pdfPreview}>
    <Image
      source={{ uri: pdf.thumbnail }}
      style={styles.previewImage}
      resizeMode="contain"
    />
  </View>
) : (
  <View style={styles.noPreviewContainer}>
    <MaterialIcons name="picture-as-pdf" size={RS(64)} color={theme.colors.textLight} />
    <Text style={styles.noPreviewText}>No preview available</Text>
  </View>
)}
```

**HistoryScreen** ([screens/HistoryScreen.tsx](screens/HistoryScreen.tsx:67-77))

Shows thumbnail in list items with fallback to generic PDF icon:

```typescript
{item.thumbnail ? (
  <Image
    source={{ uri: item.thumbnail }}
    style={styles.pdfThumbnail}
    resizeMode="cover"
  />
) : (
  <View style={styles.pdfIcon}>
    <Text style={styles.pdfIconText}>PDF</Text>
  </View>
)}
```

**HistoryScreen Thumbnail Style**:
- Size: 50x60px (matches PDF icon size)
- Border radius: `theme.radius.md`
- Resize mode: `cover` (fills thumbnail area)
- Background: `theme.colors.surface` (for loading state)

### Error Handling

**Thumbnail generation failures never prevent PDF creation**:
- Wrapped in try-catch during PDF generation
- Errors logged to console
- Returns `thumbnail: null` on failure
- PDF creation continues normally

**Missing thumbnails show graceful fallback**:
- PDFDetailScreen: "No preview available" message with PDF icon
- HistoryScreen: Blue "PDF" icon badge

**Automatic cleanup**:
- Store's `removePDF()` deletes both PDF and thumbnail files
- Store's `clearAllPDFs()` deletes all PDFs and thumbnails

### Migration Strategy

**Existing PDFs** (created before thumbnail implementation):
- Load with `thumbnail: null`
- Show graceful fallback UI
- No retroactive generation
- Users can regenerate old PDFs to get thumbnails

**New PDFs** (created after implementation):
- Thumbnails generated automatically
- Thumbnail URI stored in PDFDocument
- UI displays thumbnail image
- Thumbnail deleted when PDF is deleted

### Performance Considerations

**Memory usage**: Minimal overhead - base64 data already in memory during PDF generation

**Storage impact**: Thumbnail adds ~2-5% to total storage per document
- Example: 500KB PDF + 60KB thumbnail = ~12% increase

**Loading performance**: One additional `getInfoAsync()` call per PDF (~1ms) when loading from storage

### Type Definition

The `PDFDocument` interface includes the optional `thumbnail` property:

```typescript
export interface PDFDocument {
  id: string;
  name: string;
  uri: string;
  size: number;
  createdAt: number;
  pageCount?: number;
  thumbnail?: string | null;  // File URI to thumbnail image
}
```
