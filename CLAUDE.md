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

---

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

---

## PDF Detail Screen - Multi-Page Pagination

### Overview
[PDFDetailScreen.tsx](screens/PDFDetailScreen.tsx) displays PDF documents with horizontal page navigation and pagination controls.

### Features Implemented
1. **Multi-Page Support**: Detects and displays all pages from `pdf.pageThumbnails` array
2. **Horizontal Scrolling**: Uses FlatList with `pagingEnabled` for smooth page-to-page swiping
3. **Pagination Indicator**: Shows "X/Y" format (e.g., "1/3") for multi-page PDFs
4. **Chevron Navigation**: Left/right chevron buttons for page navigation
   - Blue (`theme.colors.primary`) when enabled
   - Gray (`theme.colors.textLight`) when disabled
5. **Three-Dots Menu**: Top-right ellipsis menu with options:
   - "Rename document" - Opens rename modal with text input and Save/Cancel buttons
   - "Manage pages" - Navigates to ManagePagesScreen

### Navigation Implementation
- **Manual Navigation**: Chevron buttons call `goToPage()` which uses `scrollToIndex()`
- **Scroll Tracking**: `handleScroll()` updates `currentPage` state based on scroll position
- **Flicker Prevention**: Only scroll events update page state (not manual navigation)

### Rename Modal Implementation
- Modal overlay with semi-transparent background (50% opacity), centered on screen
- Text input pre-filled with current document name
- **Cancel button**: Closes modal without saving, resets input state
- **Save button**: Validates input (not empty), calls `renamePDF()` store action, updates UI immediately
- Validation: Shows alert for empty or whitespace-only names

### Styling Patterns
- All sizing uses `RS()` helper for responsive spacing
- Font sizes use `RF()` helper
- Colors from `theme.colors`
- Pagination indicator: horizontal flexbox with centered content
- Menu: white card with rounded corners and shadow

---

## Manage Pages Screen - Page Selection, Reordering, and Deletion

### Overview
[ManagePagesScreen.tsx](screens/ManagePagesScreen.tsx) provides full functionality for selecting, reordering, and deleting PDF pages.

### Features Implemented
1. **Vertical List Layout**: Shows all PDF pages in a vertical scrollable list
2. **Page Selection**: Checkbox on each page card for selection
   - Tap checkbox to toggle selection
   - Selected pages show blue border (`theme.colors.primary`)
3. **Toolbar Actions**:
   - "Select All" button - Selects all pages
   - "Deselect" button - Clears all selections
   - Selection counter shows "X selected" when pages are selected
4. **Page Reordering**:
   - Up/Down arrow buttons on each page
   - Moves page up or down in the list
   - Buttons disabled at boundaries (first/last page)
   - Changes saved immediately to store via `reorderPages()`
5. **Page Deletion**:
   - "Delete Selected" button in footer
   - Confirmation dialog before deletion
   - Validates at least one page remains
   - Changes saved immediately to store via `deletePages()`
6. **Navigation**: Slides in from right with back button

### Page Item Display (Horizontal Layout)
- Checkbox on left for selection
- Thumbnail image (60x85px with 0.707 aspect ratio)
- Page number label ("Page 1", "Page 2", etc.)
- Up/Down reorder buttons on right

### Store Methods
- `reorderPages(id: string, newPageOrder: string[])` - Updates page order in PDF document
- `deletePages(id: string, pageIndicesToDelete: number[])` - Removes pages from PDF document
- Changes are reactive - UI updates automatically via useEffect when store changes

### Validation & Safety
- Prevents deletion of all pages (requires at least 1 page)
- Confirmation dialog for deletions
- Disabled state for unavailable actions (first page can't move up, etc.)

### Styling
- Uses responsive utilities (`RS()`, `RF()`) throughout
- Vertical list with horizontal page cards
- Light shadow on page cards
- Primary color for selected state and active buttons
- Red danger color for delete button
- White background cards on gray background

---

## Document Store - PDF Management Methods

### Overview
The Zustand store ([store/useDocumentStore.ts](store/useDocumentStore.ts)) provides methods for managing PDF documents and their pages.

### PDF Management Methods

#### `renamePDF(id: string, newName: string)`
- **Location**: [useDocumentStore.ts:74-78](store/useDocumentStore.ts#L74-L78)
- Updates the `name` property of a PDF document
- Changes are reactive - UI updates immediately
- Used by: PDFDetailScreen rename modal

#### `reorderPages(id: string, newPageOrder: string[])`
- **Location**: [useDocumentStore.ts:80-84](store/useDocumentStore.ts#L80-L84)
- Updates the `pageThumbnails` array with new page order
- Takes array of thumbnail URIs in desired order
- Changes are reactive - UI updates immediately via useEffect
- Used by: ManagePagesScreen up/down arrow buttons

#### `deletePages(id: string, pageIndicesToDelete: number[])`
- **Location**: [useDocumentStore.ts:86-100](store/useDocumentStore.ts#L86-L100)
- Removes pages at specified indices from `pageThumbnails` array
- Updates `thumbnail` property to first remaining page if needed
- Takes array of page indices (0-based)
- Changes are reactive - UI updates immediately via useEffect
- Used by: ManagePagesScreen delete selected functionality

#### `removePDF(id: string)`
- **Location**: [useDocumentStore.ts:44-72](store/useDocumentStore.ts#L44-L72)
- Deletes PDF file, main thumbnail, and all page thumbnails from filesystem
- Removes PDF from `savedPDFs` array
- Async operation with error handling

### Important Notes
- All store methods use Zustand's `set()` for reactive updates
- Changes propagate immediately to all subscribed components
- No need to manually refresh - components using the store update automatically
- Store methods do NOT modify the actual PDF file on disk - they only update metadata and references

---

## PDF Thumbnail Generation - Multi-Page System

### Implementation Details
The app generates individual thumbnails for each page of a PDF document.

### Thumbnail Specifications
- **Format**: JPEG at 0.7 compression
- **Size**: 800px max width (preserves aspect ratio)
- **File size**: ~60-80KB per thumbnail
- **Naming**: `{filename}_page{N}_thumb.jpg` (stored in `pdfs/` directory)
- **Storage location**: `{documentDirectory}/pdfs/{filename}_page{N}_thumb.jpg`

### Type Definition
```typescript
export interface PDFDocument {
  id: string;
  name: string;
  uri: string;
  size: number;
  createdAt: number;
  pageCount?: number;
  thumbnail?: string | null; // First page (backward compatibility)
  pageThumbnails?: string[]; // All page thumbnails
}
```

### Generation Process
1. During PDF generation ([utils/pdfUtils.ts](utils/pdfUtils.ts:207-231)):
   - Iterate through all processed images
   - Generate thumbnail for each using `generateThumbnail()`
   - Store in `pageThumbnails` array
   - First page also stored in `thumbnail` for backward compatibility

2. Loading from storage ([store/useDocumentStore.ts](store/useDocumentStore.ts:109-121)):
   - Check for page thumbnails using pattern `{filename}_page{N}_thumb.jpg`
   - Continue loading until no more thumbnails found
   - Fallback to main thumbnail for old PDFs

3. Cleanup ([store/useDocumentStore.ts](store/useDocumentStore.ts:58-63)):
   - `removePDF()` deletes all page thumbnails
   - `clearAllPDFs()` deletes all PDFs and thumbnails

### Error Handling
- Thumbnail generation failures never prevent PDF creation
- Returns `thumbnail: null` on failure
- Missing thumbnails show graceful fallback UI

---

## History Screen - Swipe-to-Reveal Actions

### Overview
[HistoryScreen.tsx](screens/HistoryScreen.tsx) displays a list of saved PDF documents with swipe-to-reveal action buttons.

### Features Implemented
1. **Swipe-to-Reveal Actions**: Users can swipe document cards left to reveal Share and Delete buttons
2. **ReanimatedSwipeable**: Uses `react-native-gesture-handler/ReanimatedSwipeable` (not deprecated `Swipeable`)
3. **Action Buttons**:
   - **Share button**: Blue background (`theme.colors.primary`), share icon only
   - **Delete button**: Red background (`theme.colors.danger`), delete icon only
   - Both buttons use white icons (24px size)

### Implementation Details
- **Wrapper Structure**: Each swipeable item wrapped in `swipeableWrapper` View for proper spacing
- **Height Matching**: Swipe action buttons exactly match document card height
  - Button height: `RS(60) + RS(32)` (thumbnail height + card padding)
  - Ensures buttons appear as seamless extension of card
- **Spacing**: `marginBottom: RS(12)` on wrapper, NOT on card itself
  - This prevents height calculation issues with swipe actions

### Swipeable Configuration
```typescript
<ReanimatedSwipeable
  renderRightActions={() => renderRightActions(item)}
  overshootRight={false}
  overshootFriction={8}
  rightThreshold={40}
>
```

### Key Styling Patterns
- `swipeableWrapper`: Contains `marginBottom` for list item spacing
- `pdfItem`: Card styles WITHOUT `marginBottom` (to match action button height)
- `swipeActionsContainer`: Simple row layout with `alignItems: 'center'`
- `swipeAction`: Fixed width (70px) and calculated height matching card
- Action buttons have rounded corners matching card style

### Functionality
- **Share**: Calls `sharePDF(pdf.uri)` utility to trigger native share dialog
- **Delete**: Shows confirmation alert, then calls `removePDF(pdf.id)` store action
- **UI Updates**: Automatic via Zustand reactive state management

### Important Notes
- Always use `ReanimatedSwipeable` (not deprecated `Swipeable`)
- Use `overshootFriction` instead of deprecated `friction` prop
- Button height must match card content height for proper alignment
- Margin must be on wrapper, not on card itself

---

## PDF File Size Optimization - Compression and Resolution Scaling

### Overview
PDFs are generated with automatic compression and resolution optimization to dramatically reduce file sizes while maintaining quality. The quality selector UI in [ImagePreviewPanel.tsx](components/ImagePreviewPanel.tsx) controls the compression level.

### Implementation Architecture

#### Core Functions in [utils/imageUtils.ts](utils/imageUtils.ts)

**`compressImage(uri: string, quality: number): Promise<string>`**
- Location: After line 199 (after `generateThumbnail()`)
- Applies JPEG compression with specified quality (0.3-1.0)
- Returns URI of compressed image

**`optimizeForPDF(uri: string, quality: number, maxWidth?: number, maxHeight?: number): Promise<{uri, width, height}>`**
- Location: After `compressImage()` in [utils/imageUtils.ts](utils/imageUtils.ts)
- **Combined compression + resolution downscaling**
- Default max dimensions: 1240×1754px (200 DPI for A4)
- Only downscales if image exceeds max dimensions (never upscales)
- Preserves aspect ratio
- Returns optimized image URI and dimensions

#### PDF Generation Integration in [utils/pdfUtils.ts](utils/pdfUtils.ts)

**`getImageOrientation(image: ImageAsset, quality: number = 0.6): Promise<ImageWithOrientation>`**
- Modified to accept quality parameter (default: 0.6 = Medium)
- Calls `optimizeForPDF()` before base64 encoding
- Returns compressed/scaled image with orientation detection

**`generatePDF(images: ImageAsset[], options: PDFGenerationOptions): Promise<PDFDocument>`**
- Extracts quality from options and converts to numeric value
- Supports both numeric (0.3-1.0) and string ('low', 'medium', 'high', 'best') quality values
- Passes quality to `getImageOrientation()` for all images
- Default quality: 0.6 (Medium)

### Quality Levels

| UI Label | Value | Compression | File Size Reduction | Use Case |
|----------|-------|-------------|---------------------|----------|
| Low | 0.3 | High | 75-80% | Email attachments, large documents |
| **Medium** | **0.6** | **Balanced** | **70-75%** | **Default - general purpose** |
| High | 0.8 | Light | 30-40% | Professional documents, presentations |
| Best | 1.0 | None | ~50% (resolution only) | Legal documents, archival |

### Type Definition in [types/document.ts](types/document.ts)

```typescript
export type PDFQuality = number | 'low' | 'medium' | 'high' | 'best';

export interface PDFGenerationOptions {
  fileName?: string;
  quality?: PDFQuality;
}
```

**Note**: Supports both numeric values (for direct control) and string literals (for backward compatibility).

### Default Settings

- **Default quality**: Medium (0.6) in [ImagePreviewPanel.tsx](components/ImagePreviewPanel.tsx:55)
- **Max resolution**: 1240×1754px (200 DPI print quality)
- **Compression applied**: During PDF generation (not at import stage)
- **Preserves**: Aspect ratios, orientation detection, editing flexibility

### Technical Details

#### Resolution Scaling Strategy
- **Target**: 200 DPI for A4 documents
  - Portrait: 1240px × 1754px max
  - Landscape: 1754px × 1240px max
- **Calculation**: `scale = min(maxWidth/width, maxHeight/height)`
- **Behavior**: Only downscales (never upscales small images)
- **Quality**: Suitable for professional printing and viewing

#### Compression Flow
1. User selects quality in preview panel
2. `generatePDF()` receives quality parameter
3. Each image processed through `optimizeForPDF()`:
   - Check dimensions → downscale if needed
   - Apply JPEG compression at specified quality
   - Return optimized image
4. Optimized images encoded to base64 and embedded in PDF

### Expected Results

| Image Type | Before | After (Medium) | Reduction |
|------------|--------|----------------|-----------|
| High-res scan (3000×4000px) | 4-6MB | 600KB-1.2MB | 75-80% |
| 5-page document | 15-20MB | 2.5-4MB | 80-85% |
| Photo-heavy PDF (10 pages) | 25-30MB | 5-8MB | 75-80% |
| Already optimized (<1240px) | 2-3MB | 800KB-1.5MB | 40-50% |

### Quality Considerations

- **Text documents**: Excellent quality even at Low/Medium settings
- **Photos/images**: Medium setting provides good balance
- **Mixed content**: High setting recommended for client-facing documents
- **Print output**: 200 DPI resolution ensures good print quality

### Backward Compatibility

- Existing PDFs remain unchanged
- Thumbnail generation unaffected (uses separate 0.7 compression)
- All editing features (rotate, crop, filter) work normally
- Old code using string quality values ('low', 'medium', 'high') still works
- New code can use numeric values (0.3-1.0) for fine control

### Important Implementation Notes

- Compression happens **during PDF generation**, not at import
- Images remain at full quality during editing phase
- Thumbnails use separate compression (0.7, 800px width)
- Store methods (reorderPages, deletePages) work with optimized PDFs
- No new dependencies required (uses existing `expo-image-manipulator`)

---
