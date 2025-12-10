import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RF, RS } from '../../utils/responsive';
import { theme } from '../../theme/theme';
import i18n from '../../i18n';
import type { Onboarding2ScreenProps } from '../../types/navigation';

export default function OnboardingScreen2({ navigation }: Onboarding2ScreenProps) {
  return (
    <LinearGradient
      colors={['#7C3AED', '#A78BFA']}
      style={StyleSheet.absoluteFill}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topSpacer} />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{i18n.t('onboarding.screen2.title')}</Text>
          <Text style={styles.subtitle}>
            {i18n.t('onboarding.screen2.subtitle')}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Onboarding3')}
          accessibilityRole="button"
          accessibilityLabel="Next, go to screen 3"
          accessibilityHint="Advances to the final onboarding screen"
        >
          <Text style={styles.buttonText}>{i18n.t('common.next')}</Text>
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
    color: '#7C3AED',
  },
});
