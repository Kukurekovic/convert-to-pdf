import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import { theme } from '../theme/theme';
import { RS } from '../utils/responsive';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [isMinimumDurationMet, setIsMinimumDurationMet] = useState(false);

  // Minimum 2-second duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinimumDurationMet(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Fade out when minimum duration met
  useEffect(() => {
    if (isMinimumDurationMet) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        onLoadingComplete();
      });
    }
  }, [isMinimumDurationMet, fadeAnim, onLoadingComplete]);

  return (
    <>
      <StatusBar style="dark" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.topSpacer} />

          <View style={styles.iconContainer}>
            <Image
              source={require('../assets/images/icon1024c.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>

          <View style={styles.middleSpacer} />

          <View style={styles.animationContainer}>
            <LottieView
              source={require('../assets/images/Loading.json')}
              autoPlay
              loop
              speed={1.0}
              style={styles.lottieAnimation}
              useNativeLooping={true}
              hardwareAccelerationAndroid={true}
              cacheComposition={true}
            />
          </View>

          <View style={styles.bottomSpacer} />
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  topSpacer: {
    flex: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: RS(150),
    height: RS(150),
    borderRadius: RS(75),
  },
  middleSpacer: {
    flex: 1,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: RS(200),
    height: RS(80),
  },
  bottomSpacer: {
    flex: 2,
  },
});

export default LoadingScreen;
