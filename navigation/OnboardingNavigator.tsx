import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { OnboardingStackParamList } from '../types/navigation';
import OnboardingScreen1 from '../screens/onboarding/OnboardingScreen1';
import OnboardingScreen2 from '../screens/onboarding/OnboardingScreen2';
import OnboardingScreen3 from '../screens/onboarding/OnboardingScreen3';

const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OnboardingStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      >
        <OnboardingStack.Screen name="Onboarding1" component={OnboardingScreen1} />
        <OnboardingStack.Screen name="Onboarding2" component={OnboardingScreen2} />
        <OnboardingStack.Screen name="Onboarding3" component={OnboardingScreen3} />
      </OnboardingStack.Navigator>
    </GestureHandlerRootView>
  );
}
