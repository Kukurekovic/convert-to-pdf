import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { RF, RS } from '../../utils/responsive';
import { theme } from '../../theme/theme';
import type { Onboarding1ScreenProps } from '../../types/navigation';

export default function OnboardingScreen1({ navigation }: Onboarding1ScreenProps) {
  // Handle Android back button - exit app on first onboarding screen
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          BackHandler.exitApp();
          return true;
        }
      );
      return () => backHandler.remove();
    }, [])
  );

  return (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6']}
      style={StyleSheet.absoluteFill}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topSpacer} />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>Convert Files to PDF</Text>
          <Text style={styles.subtitle}>
            Easily convert images, documents, and more into professional PDFs
          </Text>
        </View>

        <View style={styles.bottomSpacer} />

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Onboarding2')}
          accessibilityRole="button"
          accessibilityLabel="Next, go to screen 2"
          accessibilityHint="Advances to the next onboarding screen"
        >
          <Text style={styles.buttonText}>Next</Text>
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
    color: theme.colors.primary,
  },
});
