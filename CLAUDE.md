# CLAUDE.md (Short Version)

Guidelines for Claude Code when working with this repository.

---

## Project Overview

This is a **TypeScript React Native Expo app** for converting files to PDF.

Key technologies:
- **Expo SDK 54**, **React Native 0.81.5**
- **TypeScript (strict)**
- **React Navigation** (tabs + native stack)
- **NativeWind v2** (Tailwind)
- **Zustand** (state management)
- **@expo/vector-icons**
- Responsive utilities:  
  - `utils/responsive.ts` (`RS()`, `RF()`)  
  - `theme/theme.ts`  

**Always use RS() for spacing/sizing and RF() for fonts.
Always import colors, spacing, fonts from theme.**

**Primary color is `#6366F1` (indigo) — defined in `theme.colors.primary`.
Never hardcode color values. Always use `theme.colors.primary`, `theme.colors.textLight`, etc.**

---

## Development Commands

```bash
npx expo start --dev-client      # start dev
npm run ios                      # iOS build
LANG=en_US.UTF-8 pod install     # iOS pods fix
npm run android                  # Android build
npx expo start --clear --dev-client
npm run type-check

Convert Screen — Button Grid Rules

2×2 grid of circular buttons.

Button size: RS(100) with borderRadius: RS(60)

Active buttons:
- Row 1: Gallery | Camera
- Row 2: Files | URL Link

All colors use `theme.colors.primary` (button icons, borders, text, title).

Title uses RF(24).

Layout uses:

flex: 1.5 (top spacer)

flex: 1 (bottom spacer)

Never hardcode pixel values or colors. Always use RS/RF and theme.colors.

**Removed buttons:** Cloud and Other Apps buttons have been permanently removed from the application (as of Dec 2025).

PDF Detail Screen — Multi-Page Viewer

Core behavior:

Horizontal swipe via FlatList with pagingEnabled

Pagination indicator X/Y

Chevron left/right navigation (blue enabled, gray disabled)

Three-dots menu with:

Rename PDF

Manage Pages

Rename modal:

Pre-filled text input

Save/Cancel actions

Empty name validation

Always use RS/RF + theme colors.

Manage Pages Screen — Selection, Reorder, Delete

Features:

Vertical list of pages

Checkbox selection with blue highlight

Up/Down arrows reorder pages (first/last disabled)

“Delete Selected” with confirmation and min-1-page validation

Uses Zustand store:

reorderPages()

deletePages()

Styling:

Thumbnails ~60×85 (use RS)

White cards, blue for selected, red for delete button

Document Store — Key Methods

All methods update state reactively:

renamePDF(id, newName)
reorderPages(id, newPageOrder: string[])
deletePages(id, indices: number[])
removePDF(id)


Notes:

Store updates only metadata, not raw PDF.

UI updates automatically (no manual refresh).

PDF Thumbnails — Multi-Page System

JPEG thumbnails (~800px width)

Compression ~0.7

Naming: {filename}_page{N}_thumb.jpg

Stored in pdfs/ dir

Missing thumbnails fall back gracefully

History Screen — Search, Sort, Swipe Actions

Includes:

Search bar (case-insensitive)

Sort modal with six options:

Name A–Z / Z–A

Date newest/oldest

Size smallest/largest

Swipe left to reveal Share + Delete buttons

Uses ReanimatedSwipeable, NOT deprecated Swipeable

Delete triggers store removePDF

PDF File Size Optimization — Compression + Scaling

Implemented in:

utils/imageUtils.ts

utils/pdfUtils.ts

Core functions:

compressImage()

optimizeForPDF()

Downscale to ~1240×1754 max (200 DPI)

getImageOrientation() (now accepts quality)

generatePDF() (quality pipeline)

Quality options:

Label	Value
low	0.3
medium (default)	0.6
high	0.8
best	1.0

Behavior:

Compression done only during PDF generation.

Images remain full quality during editing.

Aspect ratio preserved.

Thumbnails unaffected.

Expected file size reduction: 70–85%.

## Color System Architecture

**Primary Color:** `#6366F1` (indigo)
- Defined in: `theme/theme.ts` → `theme.colors.primary`
- Also synced in: `tailwind.config.js` (line 12)

**Usage:**
- ConvertScreen: All buttons, title, borders use `theme.colors.primary`
- App.tsx: `tabBarActiveTintColor: theme.colors.primary`
- App.tsx: `tabBarInactiveTintColor: theme.colors.textLight`

**Exceptions (intentional):**
- ImagePreviewPanel: Green (`#22c55e`) and purple (`#a855f7`) buttons remain hardcoded for visual distinction

**Rule:** Never create local color constants (like `BUTTON_COLOR`). Always reference `theme.colors.*` directly.

---

## Critical Rules for Claude

Use RS() and RF() for everything — no raw numbers.

Import all colors, spacing, and font sizes from theme.

Never hardcode color values — always use `theme.colors.primary`, `theme.colors.textLight`, etc.

Never use deprecated Swipeable — always ReanimatedSwipeable.

Store actions are the single source of truth; do not mutate data locally.

PDF quality is controlled only via generatePDF() pipeline.