import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RF, RS } from '../../utils/responsive';
import i18n from '../../i18n';
import type { Onboarding2ScreenProps } from '../../types/navigation';

export default function OnboardingScreen2({ navigation }: Onboarding2ScreenProps) {
  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/onb2.png')}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradient}
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{i18n.t('onboarding.screen2.title')}</Text>
          <Text style={styles.subtitle}>
            {i18n.t('onboarding.screen2.subtitle')}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Onboarding3')}
            accessibilityRole="button"
            accessibilityLabel="Continue to screen 3"
            accessibilityHint="Advances to the final onboarding screen"
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>{i18n.t('common.continue')}</Text>
              <MaterialIcons
                name="arrow-forward"
                size={RS(20)}
                color="#FFFFFF"
                style={styles.arrowIcon}
              />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 2.5,
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: RS(100),
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: RS(16),
  },
  title: {
    fontSize: RF(32),
    fontFamily: 'Urbanist_700Bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: RS(16),
  },
  subtitle: {
    fontSize: RF(18),
    fontFamily: 'Urbanist_400Regular',
    color: '#000000',
    textAlign: 'center',
    opacity: 0.9,
  },
  bottomSpacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: RS(24),
  },
  button: {
    backgroundColor: '#2350E0',
    paddingVertical: RS(24),
    borderRadius: RS(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: RS(24),
  },
  buttonText: {
    fontSize: RF(18),
    fontFamily: 'Urbanist_700Bold',
    color: '#FFFFFF',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  arrowIcon: {
    position: 'absolute',
    right: RS(16),
  },
});
