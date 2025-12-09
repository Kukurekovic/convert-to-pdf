import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import OnboardingNavigator from './OnboardingNavigator';
import TabNavigator from './TabNavigator';
import { useOnboardingStore } from '../store/useOnboardingStore';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isCompleted = useOnboardingStore((state) => state.isCompleted);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isCompleted ? (
        <RootStack.Screen name="OnboardingStack" component={OnboardingNavigator} />
      ) : (
        <RootStack.Screen name="MainApp" component={TabNavigator} />
      )}
    </RootStack.Navigator>
  );
}
