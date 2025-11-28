# Convert to PDF App

A modern React Native Expo app for converting images to PDF with document scanning capabilities.

## Features

✅ **Camera Integration** - Capture photos with react-native-vision-camera
✅ **Gallery Import** - Select multiple images from photo library
✅ **Document Scanner** - Auto-crop and detect document edges
✅ **Image Editing** - Rotate, flip, and apply filters to images
✅ **PDF Generation** - Convert multiple images into a single PDF
✅ **PDF Management** - View, share, and delete saved PDFs
✅ **Settings** - Configure quality and app preferences
✅ **Responsive Design** - Uses custom responsive utilities for all screen sizes

## Tech Stack

### Core
- **React Native** 0.81.5
- **Expo SDK** 54
- **Expo Dev Client** for native development
- **React Navigation** with bottom tabs

### Styling
- **NativeWind v2** for utility classes
- **Custom Responsive System** (`utils/responsive.js` + `theme/theme.js`)

### Features
- **zustand** - State management
- **react-native-vision-camera** - Camera functionality
- **react-native-document-scanner-plugin** - Document scanning
- **expo-image-picker** - Gallery access
- **expo-image-manipulator** - Image editing
- **expo-print** - PDF generation
- **expo-file-system** - File management
- **expo-sharing** - Share PDFs
- **react-native-reanimated** - Animations
- **react-native-gesture-handler** - Touch gestures
- **react-native-svg** - Vector graphics

## Project Structure

```
.
├── App.js                      # Main navigation setup
├── screens/
│   ├── ConvertScreen.js        # Image capture/import & scanning
│   ├── HistoryScreen.js        # Saved PDFs list
│   └── SettingsScreen.js       # App settings & preferences
├── components/
│   ├── CameraView.js           # Camera interface
│   ├── ImageEditor.js          # Image editing (rotate, filters)
│   └── PDFPreview.js           # PDF preview & save
├── store/
│   └── useDocumentStore.js     # Zustand store
├── utils/
│   ├── responsive.js           # Responsive sizing utilities
│   ├── imageUtils.js           # Image processing functions
│   └── pdfUtils.js             # PDF generation & sharing
└── theme/
    └── theme.js                # Theme configuration
```

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. iOS Setup (macOS only):
```bash
cd ios
LANG=en_US.UTF-8 pod install
cd ..
```

3. Prebuild native code (if needed):
```bash
npx expo prebuild --clean
```

### Running the App

#### iOS
```bash
# Start Metro bundler
npx expo start --dev-client

# In another terminal, run iOS
LANG=en_US.UTF-8 npx expo run:ios
```

#### Android
```bash
# Start Metro bundler
npx expo start --dev-client

# In another terminal, run Android
npx expo run:android
```

### Clear Cache
```bash
npx expo start --clear --dev-client
```

## Usage

### Convert Screen
1. **Camera** - Open camera to capture documents
2. **Gallery** - Select images from photo library
3. **Scan Doc** - Use document scanner with auto-crop
4. **Generate PDF** - Create PDF from selected images

### Image Editing
- Tap any image to open the editor
- Rotate 90° clockwise/counter-clockwise
- Flip horizontally or vertically
- Apply filters (Grayscale, Enhance, B&W)

### History Screen
- View all saved PDFs
- Share PDFs via system share sheet
- Delete individual PDFs
- Clear all history

### Settings Screen
- Toggle auto-enhance for images
- Select PDF quality (Low/Medium/High)
- Clear cache
- Clear history

## Responsive Design Guidelines

The app uses a custom responsive system. **Always** use these utilities instead of hardcoded values:

| Element | Utility |
|---------|---------|
| Width/Height | `wp()`, `hp()` |
| Fonts | `RF()` |
| Padding/Margin/Radius | `RS()` |
| Images | `imgSize()` |
| Colors | `theme.colors.*` |
| Spacing | `theme.spacing.*` |

Example:
```javascript
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';

const styles = StyleSheet.create({
  button: {
    height: RS(48),
    paddingHorizontal: RS(16),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: RF(16),
    color: theme.colors.white,
  },
});
```

## Key Files

- [app.json](app.json) - Expo configuration & permissions
- [babel.config.js](babel.config.js) - Babel configuration
- [CLAUDE.md](CLAUDE.md) - Project guidelines for AI assistants
- [package.json](package.json) - Dependencies

## Permissions

### iOS
- Camera access
- Photo library access
- Photo library add permission

### Android
- Camera
- Read external storage
- Write external storage

## Building for Production

### iOS
```bash
npx expo run:ios --configuration Release
```

### Android
```bash
npx expo run:android --variant release
```

## Known Issues

- Document scanner requires native build (not compatible with Expo Go)
- VisionCamera requires physical device for testing
- Frame processors disabled (react-native-worklets-core not found)

## License

MIT

## Support

For issues and questions, please check the documentation or create an issue in the repository.
