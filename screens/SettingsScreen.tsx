import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Linking, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useDocumentStore from '../store/useDocumentStore';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import type { SettingsScreenProps } from '../types/navigation';

export default function SettingsScreen({}: SettingsScreenProps) {
  const settings = useDocumentStore((state) => state.settings);
  const updateSettings = useDocumentStore((state) => state.updateSettings);

  const handleToggleAutoEnhance = (value: boolean): void => {
    updateSettings({ autoEnhance: value });
  };

  const handleOpenURL = async (url: string): Promise<void> => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open URL');
    }
  };

  const handleContactSupport = async (): Promise<void> => {
    const email = 'contact@makefast.app';
    const url = `mailto:${email}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Failed to open email client');
    }
  };

  const handleShareApp = async (): Promise<void> => {
    try {
      await Share.share({
        message: 'Check out this amazing PDF converter app!',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const handleRateUs = (): void => {
    // Placeholder - no functionality for now
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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

        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => handleOpenURL('https://www.makefast.app/help-center')}
            >
              <Ionicons name="help-circle-outline" size={RF(20)} color={theme.colors.primary} />
              <Text style={styles.buttonText}>FAQ & Help</Text>
              <Ionicons name="chevron-forward" size={RF(20)} color={theme.colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => handleOpenURL('https://www.makefast.app/privacy')}
            >
              <Ionicons name="shield-checkmark-outline" size={RF(20)} color={theme.colors.primary} />
              <Text style={styles.buttonText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={RF(20)} color={theme.colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => handleOpenURL('https://www.makefast.app/terms')}
            >
              <Ionicons name="document-text-outline" size={RF(20)} color={theme.colors.primary} />
              <Text style={styles.buttonText}>Terms of Use</Text>
              <Ionicons name="chevron-forward" size={RF(20)} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={handleContactSupport}
            >
              <Ionicons name="mail-outline" size={RF(20)} color={theme.colors.primary} />
              <Text style={styles.buttonText}>Contact Support</Text>
              <Ionicons name="chevron-forward" size={RF(20)} color={theme.colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={handleShareApp}
            >
              <Ionicons name="share-social-outline" size={RF(20)} color={theme.colors.primary} />
              <Text style={styles.buttonText}>Share app</Text>
              <Ionicons name="chevron-forward" size={RF(20)} color={theme.colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={handleRateUs}
            >
              <Ionicons name="star-outline" size={RF(20)} color={theme.colors.primary} />
              <Text style={styles.buttonText}>Rate us</Text>
              <Ionicons name="chevron-forward" size={RF(20)} color={theme.colors.textLight} />
            </TouchableOpacity>
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
  button: {
    backgroundColor: theme.colors.white,
    padding: RS(16),
    borderRadius: theme.radius.lg,
    marginBottom: RS(12),
    ...theme.shadows.light,
  },
  buttonText: {
    flex: 1,
    fontSize: RF(16),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.text,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    marginBottom: RS(12),
    ...theme.shadows.light,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: RS(16),
    gap: RS(12),
  },
});
