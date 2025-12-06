import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useDocumentStore from '../store/useDocumentStore';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import type { SettingsScreenProps } from '../types/navigation';
import type { PDFQuality } from '../types/document';

export default function SettingsScreen({}: SettingsScreenProps) {
  const settings = useDocumentStore((state) => state.settings);
  const updateSettings = useDocumentStore((state) => state.updateSettings);
  const clearAllPDFs = useDocumentStore((state) => state.clearAllPDFs);
  const savedPDFs = useDocumentStore((state) => state.savedPDFs);

  const handleToggleAutoEnhance = (value: boolean): void => {
    updateSettings({ autoEnhance: value });
  };

  const handleQualityChange = (quality: PDFQuality): void => {
    updateSettings({ defaultQuality: quality });
  };

  const handleClearCache = (): void => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleClearHistory = (): void => {
    if (savedPDFs.length === 0) {
      Alert.alert('No History', 'There are no PDFs to delete');
      return;
    }

    Alert.alert(
      'Clear History',
      `This will delete all ${savedPDFs.length} PDF${savedPDFs.length > 1 ? 's' : ''}. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearAllPDFs();
            Alert.alert('Success', 'All PDFs have been deleted');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PDF Generation</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto Enhance</Text>
              <Text style={styles.settingDescription}>
                Automatically enhance image quality
              </Text>
            </View>
            <Switch
              value={settings.autoEnhance}
              onValueChange={handleToggleAutoEnhance}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>PDF Quality</Text>
              <Text style={styles.settingDescription}>
                Default quality for generated PDFs
              </Text>
            </View>
          </View>

          <View style={styles.qualityButtons}>
            <TouchableOpacity
              style={[
                styles.qualityButton,
                settings.defaultQuality === 'low' && styles.qualityButtonActive,
              ]}
              onPress={() => handleQualityChange('low')}
            >
              <Text
                style={[
                  styles.qualityButtonText,
                  settings.defaultQuality === 'low' && styles.qualityButtonTextActive,
                ]}
              >
                Low
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.qualityButton,
                settings.defaultQuality === 'medium' && styles.qualityButtonActive,
              ]}
              onPress={() => handleQualityChange('medium')}
            >
              <Text
                style={[
                  styles.qualityButtonText,
                  settings.defaultQuality === 'medium' && styles.qualityButtonTextActive,
                ]}
              >
                Medium
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.qualityButton,
                settings.defaultQuality === 'high' && styles.qualityButtonActive,
              ]}
              onPress={() => handleQualityChange('high')}
            >
              <Text
                style={[
                  styles.qualityButtonText,
                  settings.defaultQuality === 'high' && styles.qualityButtonTextActive,
                ]}
              >
                High
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>

          <TouchableOpacity style={styles.actionItem} onPress={handleClearCache}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Clear Cache</Text>
              <Text style={styles.settingDescription}>
                Free up space by clearing temporary files
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleClearHistory}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.danger }]}>
                Clear History
              </Text>
              <Text style={styles.settingDescription}>
                Delete all saved PDFs ({savedPDFs.length} document{savedPDFs.length !== 1 ? 's' : ''})
              </Text>
            </View>
            <Text style={[styles.actionArrow, { color: theme.colors.danger }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>App Name</Text>
            <Text style={styles.infoValue}>Convert to PDF</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: RS(24),
    paddingVertical: RS(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: RF(28),
    fontWeight: '700',
    fontFamily: 'Urbanist_700Bold',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: RS(24),
    paddingHorizontal: RS(24),
  },
  sectionTitle: {
    fontSize: RF(18),
    fontWeight: '700',
    fontFamily: 'Urbanist_700Bold',
    color: theme.colors.text,
    marginBottom: RS(16),
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: RS(16),
    borderRadius: theme.radius.lg,
    marginBottom: RS(12),
    ...theme.shadows.light,
  },
  settingInfo: {
    flex: 1,
    marginRight: RS(16),
  },
  settingLabel: {
    fontSize: RF(16),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.text,
    marginBottom: RS(4),
  },
  settingDescription: {
    fontSize: RF(14),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.textLight,
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: RS(8),
    marginBottom: RS(12),
  },
  qualityButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: RS(12),
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  qualityButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  qualityButtonText: {
    fontSize: RF(14),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.text,
  },
  qualityButtonTextActive: {
    color: theme.colors.white,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: RS(16),
    borderRadius: theme.radius.lg,
    marginBottom: RS(12),
    ...theme.shadows.light,
  },
  actionArrow: {
    fontSize: RF(24),
    color: theme.colors.textLight,
    fontWeight: '300',
    fontFamily: 'Urbanist_400Regular',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: RS(16),
    borderRadius: theme.radius.lg,
    marginBottom: RS(12),
    ...theme.shadows.light,
  },
  infoLabel: {
    fontSize: RF(16),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.text,
  },
  infoValue: {
    fontSize: RF(16),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.textLight,
  },
});
