import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RF, RS } from '../../utils/responsive';
import { theme } from '../../theme/theme';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import i18n from '../../i18n';
import type { Onboarding3ScreenProps } from '../../types/navigation';

export default function OnboardingScreen3({}: Onboarding3ScreenProps) {
  const setCompleted = useOnboardingStore((state) => state.setCompleted);

  const handleGetStarted = () => {
    setCompleted(true);
    // Navigation will automatically update via App.tsx watching the store
  };

  return (
    <LinearGradient
      colors={['#059669', '#10B981']}
      style={StyleSheet.absoluteFill}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topSpacer} />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{i18n.t('onboarding.screen3.title')}</Text>
          <Text style={styles.subtitle}>
            {i18n.t('onboarding.screen3.subtitle')}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />

        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          accessibilityRole="button"
          accessibilityLabel="Get Started"
          accessibilityHint="Complete onboarding and start using the app"
        >
          <Text style={styles.buttonText}>{i18n.t('onboarding.screen3.button')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: RS(24),
  },
  topSpacer: {
    flex: 1.5,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: RS(16),
  },
  title: {
    fontSize: RF(32),
    fontFamily: 'Urbanist_700Bold',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: RS(16),
  },
  subtitle: {
    fontSize: RF(18),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  bottomSpacer: {
    flex: 1,
  },
  button: {
    backgroundColor: theme.colors.white,
    height: RS(56),
    borderRadius: RS(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: RS(24),
  },
  buttonText: {
    fontSize: RF(18),
    fontFamily: 'Urbanist_700Bold',
    color: '#059669',
  },
});
