# i18n Implementation Guide

## ✅ Completed Setup

1. **Dependencies Installed**
   - `expo-localization`
   - `i18n-js`

2. **Configuration Files Created**
   - `i18n/index.ts` - i18n configuration with device locale detection
   - `i18n/locales/en.json` - English translations (complete)
   - `i18n/locales/de.json` - German translations (complete)

3. **App Initialization**
   - `App.tsx` - i18n imported and initialized

4. **Screens Already Updated**
   - ✅ OnboardingScreen1.tsx
   - ✅ OnboardingScreen2.tsx
   - ✅ OnboardingScreen3.tsx
   - ✅ ConvertScreen.tsx

## 🔄 Remaining Implementation

### Step 1: Update HistoryScreen.tsx

Add import:
```typescript
import i18n from '../i18n';
```

Replace strings:
- Line 213: `<Text style={styles.title}>History</Text>` → `<Text style={styles.title}>{i18n.t('history.title')}</Text>`
- Line 227: `placeholder="Search PDFs..."` → `placeholder={i18n.t('history.search')}`
- Line 267: `<Text style={styles.sortMenuTitle}>Sort by</Text>` → `<Text style={styles.sortMenuTitle}>{i18n.t('history.sortBy')}</Text>`
- Line 202: `<Text style={styles.emptyTitle}>No PDFs Yet</Text>` → `<Text style={styles.emptyTitle}>{i18n.t('history.empty.title')}</Text>`
- Line 203-205: Empty message → `{i18n.t('history.empty.message')}`
- Line 111-112: Alert title/message → `i18n.t('history.alerts.deletePDF')`, `i18n.t('history.alerts.deleteMessage', { name: pdf.name })`
- Line 105: Alert → `i18n.t('convert.alerts.errorTitle')`, `i18n.t('history.alerts.failedToShare')`
- Lines 80-91: getSortLabel function → return `i18n.t('history.sortOptions.*')`

### Step 2: Update PDFDetailScreen.tsx

Add import:
```typescript
import i18n from '../i18n';
```

Replace strings:
- Line 46: `Alert.alert('Error', 'PDF not found'` → `Alert.alert(i18n.t('convert.alerts.errorTitle'), i18n.t('pdfDetail.alerts.pdfNotFound')`
- Line 60: `Alert.alert('Error', 'Failed to share PDF')` → `Alert.alert(i18n.t('convert.alerts.errorTitle'), i18n.t('pdfDetail.alerts.failedToShare'))`
- Line 69-70: Delete alert → `i18n.t('pdfDetail.alerts.deletePDF')`, `i18n.t('pdfDetail.alerts.deleteMessage', { name: pdf.name })`
- Line 72: `text: 'Cancel'` → `text: i18n.t('common.cancel')`
- Line 74: `text: 'Delete'` → `text: i18n.t('common.delete')`
- Line 199: `<Text style={styles.menuItemText}>Rename document</Text>` → `{i18n.t('pdfDetail.menu.rename')}`
- Line 207: `<Text style={styles.menuItemText}>Manage pages</Text>` → `{i18n.t('pdfDetail.menu.managePages')}`
- Line 226: `<Text style={styles.renameModalTitle}>Rename Document</Text>` → `{i18n.t('pdfDetail.renameModal.title')}`
- Line 231: `placeholder="Enter new name"` → `placeholder={i18n.t('pdfDetail.renameModal.placeholder')}`
- Line 240: `<Text style={styles.cancelButtonText}>Cancel</Text>` → `{i18n.t('common.cancel')}`
- Line 246: `<Text style={styles.saveButtonText}>Save</Text>` → `{i18n.t('common.save')}`
- Line 131: `Alert.alert('Invalid Name', 'Please enter a valid filename.')` → `Alert.alert(i18n.t('pdfDetail.renameModal.invalidName'), i18n.t('pdfDetail.renameModal.invalidNameMessage'))`
- Line 306: `<Text style={styles.noPreviewText}>No preview available</Text>` → `{i18n.t('pdfDetail.noPreview')}`
- Line 321: `<Text style={styles.actionButtonText}>Share</Text>` → `{i18n.t('common.share')}`
- Line 336: `<Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>` → `{i18n.t('common.delete')}`

###Step 3: Update ManagePagesScreen.tsx

Add import:
```typescript
import i18n from '../i18n';
```

Replace strings:
- Line 212: `<Text style={styles.headerTitle}>Manage Pages</Text>` → `{i18n.t('managePages.title')}`
- Line 219: `<Text style={styles.toolbarButtonText}>Select All</Text>` → `{i18n.t('managePages.selectAll')}`
- Line 223: `<Text style={styles.toolbarButtonText}>Deselect</Text>` → `{i18n.t('managePages.deselect')}`
- Line 226: `<Text style={styles.selectedCount}>{selectedCount} selected</Text>` → `{i18n.t('common.selected')}`
- Line 170: `<Text style={styles.pageNumber}>Page {item.index + 1}</Text>` → `{i18n.t('managePages.pageNumber', { number: item.index + 1 })}`
- Line 257: `<Text style={...}>Delete Selected</Text>` → `{i18n.t('managePages.deleteSelected')}`
- Line 116: Alert → `i18n.t('managePages.alerts.noPagesSelected')`, `i18n.t('managePages.alerts.noPagesSelectedMessage')`
- Line 121: Alert → `i18n.t('managePages.alerts.cannotDeleteAll')`, `i18n.t('managePages.alerts.cannotDeleteAllMessage')`
- Line 125-127: Delete alert → `i18n.t('managePages.alerts.deletePages')`, `i18n.t('managePages.alerts.deletePagesMessage', { count: selectedIndices.length })`
- Line 129: `text: 'Cancel'` → `text: i18n.t('common.cancel')`
- Line 131: `text: 'Delete'` → `text: i18n.t('common.delete')`

### Step 4: Update SettingsScreen.tsx

Add import:
```typescript
import i18n from '../i18n';
```

Replace strings:
- Line 66: `<Text style={styles.title}>Settings</Text>` → `{i18n.t('settings.title')}`
- Line 71: `<Text style={styles.sectionTitle}>Info</Text>` → `{i18n.t('settings.info.title')}`
- Line 79: `<Text style={styles.buttonText}>FAQ & Help</Text>` → `{i18n.t('settings.info.faq')}`
- Line 88: `<Text style={styles.buttonText}>Privacy Policy</Text>` → `{i18n.t('settings.info.privacy')}`
- Line 97: `<Text style={styles.buttonText}>Terms of Use</Text>` → `{i18n.t('settings.info.terms')}`
- Line 104: `<Text style={styles.sectionTitle}>Support</Text>` → `{i18n.t('settings.support.title')}`
- Line 112: `<Text style={styles.buttonText}>Contact Support</Text>` → `{i18n.t('settings.support.contact')}`
- Line 121: `<Text style={styles.buttonText}>Share app</Text>` → `{i18n.t('settings.support.share')}`
- Line 130: `<Text style={styles.buttonText}>Rate us</Text>` → `{i18n.t('settings.support.rate')}`
- Line 142: `<Text style={styles.versionText}>Version 1.0.0</Text>` → `{i18n.t('settings.version')}`
- Line 144: Dev text → `{i18n.t('settings.devMode')}`
- Line 16: Alert → `i18n.t('convert.alerts.errorTitle')`, `i18n.t('settings.alerts.cannotOpenURL', { url })`
- Line 19: Alert → `i18n.t('convert.alerts.errorTitle')`, `i18n.t('settings.alerts.failedToOpenURL')`
- Line 29: Alert → `i18n.t('convert.alerts.errorTitle')`, `i18n.t('settings.alerts.failedToOpenEmail')`
- Line 36: Share message → `message: i18n.t('settings.alerts.shareMessage')`
- Line 39: Alert → `i18n.t('convert.alerts.errorTitle')`, `i18n.t('settings.alerts.failedToShare')`
- Line 51-53: Alert → `i18n.t('settings.alerts.onboardingReset')`, `i18n.t('settings.alerts.onboardingResetMessage')`, `text: i18n.t('common.ok')`
- Line 58: Alert → `i18n.t('convert.alerts.errorTitle')`, `i18n.t('settings.alerts.failedToResetOnboarding')`

### Step 5: Update TabNavigator.tsx

```typescript
import i18n from '../i18n';

// In screen options:
<Tab.Screen
  name="Convert"
  component={ConvertScreen}
  options={{
    title: i18n.t('tabs.convert'),
    // ...
  }}
/>
<Tab.Screen
  name="History"
  component={HistoryStack}
  options={{
    title: i18n.t('tabs.history'),
    // ...
  }}
/>
<Tab.Screen
  name="Settings"
  component={SettingsScreen}
  options={{
    title: i18n.t('tabs.settings'),
    // ...
  }}
/>
```

### Step 6: Update ImagePreviewPanel.tsx (optional, based on needs)

If you need translation for quality options and buttons in ImagePreviewPanel:

```typescript
import i18n from '../i18n';

// Update qualityOptions array:
const qualityOptions: QualityOption[] = [
  { label: i18n.t('imagePreview.qualityOptions.low'), value: 0.3 },
  { label: i18n.t('imagePreview.qualityOptions.medium'), value: 0.6 },
  { label: i18n.t('imagePreview.qualityOptions.high'), value: 1.0 },
];

// Update alert messages and button labels
```

## Testing

1. **Test on English device:**
   - All text should appear in English

2. **Test on German device:**
   - Change device language to German
   - Restart the app
   - All text should appear in German

3. **Test device language fallback:**
   - Set device to unsupported language (e.g., French)
   - App should default to English

## How Device Language Detection Works

The `i18n/index.ts` file uses `getLocales()` from `expo-localization`:

```typescript
const deviceLocale = getLocales()[0]?.languageCode || 'en';
i18n.locale = deviceLocale;
```

This automatically:
- Detects device language (e.g., "en-US" → "en", "de-DE" → "de")
- Sets app language to match
- Falls back to English if language not supported

## Adding More Languages

To add Spanish (es):

1. Create `i18n/locales/es.json` with Spanish translations
2. Update `i18n/index.ts`:
```typescript
import es from './locales/es.json';

const i18n = new I18n({
  en,
  de,
  es, // Add Spanish
});
```

3. App will automatically use Spanish when device is set to Spanish

## Support

All translation keys are documented in:
- `i18n/locales/en.json` - English (reference)
- `i18n/locales/de.json` - German (complete)

Use dot notation: `i18n.t('section.subsection.key')`
Dynamic values: `i18n.t('key', { name: 'value' })`
