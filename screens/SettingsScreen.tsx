import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import i18n from '../i18n';
import type { SettingsScreenProps } from '../types/navigation';
// @ts-ignore - Paywall module has internal TS errors but works at runtime
import { usePaywallTrigger } from '../paywall-module';

export default function SettingsScreen({}: SettingsScreenProps) {
  const { tryShowPaywall } = usePaywallTrigger();

  const handleOpenURL = async (url: string): Promise<void> => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(i18n.t('convert.alerts.errorTitle'), i18n.t('settings.alerts.cannotOpenURL', { url }));
      }
    } catch (error) {
      Alert.alert(i18n.t('convert.alerts.errorTitle'), i18n.t('settings.alerts.failedToOpenURL'));
    }
  };

  const handleContactSupport = async (): Promise<void> => {
    const email = 'contact@makefast.app';
    const url = `mailto:${email}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(i18n.t('convert.alerts.errorTitle'), i18n.t('settings.alerts.failedToOpenEmail'));
    }
  };

  const handleShareApp = async (): Promise<void> => {
    try {
      const message = i18n.t('settings.alerts.shareMessage');
      await Share.share({
        message: message || 'Check out this PDF converter app!',
      });
    } catch (error) {
      Alert.alert(i18n.t('convert.alerts.errorTitle'), i18n.t('settings.alerts.failedToShare'));
    }
  };

  const handleRateUs = (): void => {
    // Placeholder - no functionality for now
  };

  const handleResetOnboarding = async (): Promise<void> => {
    if (__DEV__) {
      try {
        await AsyncStorage.removeItem('onboarding-storage');
        Alert.alert(
          i18n.t('settings.alerts.onboardingReset'),
          i18n.t('settings.alerts.onboardingResetMessage'),
          [{ text: i18n.t('common.ok') }]
        );
      } catch (error) {
        console.error('Failed to reset onboarding:', error);
        Alert.alert(i18n.t('convert.alerts.errorTitle'), i18n.t('settings.alerts.failedToResetOnboarding'));
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('settings.title')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.premiumSection}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardButton}
              activeOpacity={0.7}
              onPress={tryShowPaywall}
            >
              <Ionicons name="ribbon" size={RF(20)} color={theme.colors.warning} />
              <Text style={styles.buttonText}>{i18n.t('settings.premium.title')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('settings.info.title')}</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => handleOpenURL('https://www.makefast.app/help-center')}
            >
              <Ionicons name="help-circle-outline" size={RF(20)} color={theme.colors.primary} />
              <Text style={styles.buttonText}>{i18n.t('settings.info.faq')}</Text>
              <Ionicons name="chevron-forward" size={RF(20)} color={theme.colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => handleOpenURL('https://www.makefast.app/privacy')}
            >
              <Ionicons name="shield-checkmark-outline" size={RF(20)} color={theme.colors.primary} />
              <Text style={styles.buttonText}>{i18n.t('settings.info.privacy')}</Text>
              <Ionicons name="chevron-forward" size={RF(20)} color={theme.colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => handleOpenURL('https://www.makefast.app/terms')}
            >
              <Ionicons name="document-text-outline" size={RF(20)} color={theme.colors.primary} />
              <Text style={styles.buttonText}>{i18n.t('settings.info.terms')}</Text>
              <Ionicons name="chevron-forward" size={RF(20)} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('settings.support.title')}</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={handleContactSupport}
            >
              <Ionicons name="mail-outline" size={RF(20)} color={theme.colors.primary} />
              <Text style={styles.buttonText}>{i18n.t('settings.support.contact')}</Text>
              <Ionicons name="chevron-forward" size={RF(20)} color={theme.colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={handleShareApp}
            >
              <Ionicons name="share-social-outline" size={RF(20)} color={theme.colors.primary} />
              <Text style={styles.buttonText}>{i18n.t('settings.support.share')}</Text>
              <Ionicons name="chevron-forward" size={RF(20)} color={theme.colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardButton}
              onPress={handleRateUs}
            >
              <Ionicons name="star-outline" size={RF(20)} color={theme.colors.primary} />
              <Text style={styles.buttonText}>{i18n.t('settings.support.rate')}</Text>
              <Ionicons name="chevron-forward" size={RF(20)} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Developer Tools - Hidden, long-press to activate */}
        <View style={styles.section}>
          <TouchableOpacity
            onLongPress={handleResetOnboarding}
            style={styles.versionContainer}
          >
            <Text style={styles.versionText}>{i18n.t('settings.version')}</Text>
            {__DEV__ && (
              <Text style={styles.devText}>{i18n.t('settings.devMode')}</Text>
            )}
          </TouchableOpacity>
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
    marginTop: RS(14),
    paddingHorizontal: RS(24),
  },
  sectionTitle: {
    fontSize: RF(18),
    fontWeight: '700',
    fontFamily: 'Urbanist_700Bold',
    color: theme.colors.text,
    marginBottom: RS(12),
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
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
    marginBottom: RS(8),
    ...theme.shadows.light,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: RS(16),
    gap: RS(12),
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: RS(24),
  },
  versionText: {
    fontSize: RF(14),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.textLight,
  },
  devText: {
    fontSize: RF(12),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.textLight,
    marginTop: RS(4),
    fontStyle: 'italic',
  },
  premiumSection: {
    marginTop: RS(16),
    paddingHorizontal: RS(24),
    marginBottom: RS(2),
  },
});
