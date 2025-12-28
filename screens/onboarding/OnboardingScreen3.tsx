import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { RF, RS } from '../../utils/responsive';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import i18n from '../../i18n';
import type { Onboarding3ScreenProps } from '../../types/navigation';

export default function OnboardingScreen3({ navigation }: Onboarding3ScreenProps) {
  const setCompleted = useOnboardingStore((state) => state.setCompleted);

  const handleGetStarted = () => {
    setCompleted(true);
    // Navigation will automatically update via App.tsx watching the store
  };

  const completeOnboarding = () => {
    setCompleted(true);
  };

  const goBack = () => {
    navigation.goBack();
  };

  // Fade-in animation to smooth layout shifts
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onEnd((event) => {
      'worklet';
      if (event.translationX < -30 || event.velocityX < -200) {
        // Swipe left - complete onboarding (same as Continue button)
        runOnJS(completeOnboarding)();
      } else if (event.translationX > 30 || event.velocityX > 200) {
        // Swipe right - go back to Screen2
        runOnJS(goBack)();
      }
    });

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <GestureDetector gesture={swipeGesture}>
      <View style={styles.background}>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/onb3.png')}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0)',
              'rgba(255, 255, 255, 0.3)',
              'rgba(255, 255, 255, 0.7)',
              'rgba(255, 255, 255, 1)',
            ]}
            locations={[0, 0.3, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradient}
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{i18n.t('onboarding.screen3.title')}</Text>
          <Text style={styles.subtitle}>
            {i18n.t('onboarding.screen3.subtitle')}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            accessibilityRole="button"
            accessibilityLabel="Continue"
            accessibilityHint="Complete onboarding and start using the app"
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
    </GestureDetector>
    </Animated.View>
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
    flex: 3.5,
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
    height: RS(150),
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
    flex: 0.5,
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
