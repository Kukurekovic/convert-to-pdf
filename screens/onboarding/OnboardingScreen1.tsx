import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RF, RS } from '../../utils/responsive';
import i18n from '../../i18n';
import type { Onboarding1ScreenProps } from '../../types/navigation';
import UserReviewsCarousel from '../../components/UserReviewsCarousel';

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
    <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/onb1.png')}
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
          <Text style={styles.title}>{i18n.t('onboarding.screen1.title')}</Text>
        </View>

        <View style={styles.reviewsContainer}>
          <UserReviewsCarousel />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Onboarding2')}
            accessibilityRole="button"
            accessibilityLabel="Continue to screen 2"
            accessibilityHint="Advances to the next onboarding screen"
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>{i18n.t('common.continue')}</Text>
              <MaterialIcons
                name="arrow-forward"
                size={RS(16)}
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
    fontSize: RF(28),
    fontFamily: 'Urbanist_700Bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: RS(8),
  },
  subtitle: {
    fontSize: RF(18),
    fontFamily: 'Urbanist_400Regular',
    color: '#000000',
    textAlign: 'center',
    opacity: 0.9,
  },
  reviewsContainer: {
    flex: 1,
    justifyContent: 'center',
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
    fontSize: RF(16),
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
