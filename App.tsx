import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import ConvertScreen from './screens/ConvertScreen';
import HistoryScreen from './screens/HistoryScreen';
import PDFDetailScreen from './screens/PDFDetailScreen';
import ManagePagesScreen from './screens/ManagePagesScreen';
import SettingsScreen from './screens/SettingsScreen';
import { theme } from './theme/theme';
import type { RootTabParamList, HistoryStackParamList } from './types/navigation';
import { useFonts, Urbanist_400Regular, Urbanist_600SemiBold, Urbanist_700Bold } from '@expo-google-fonts/urbanist';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();

function HistoryNavigator() {
  return (
    <HistoryStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <HistoryStack.Screen name="HistoryList" component={HistoryScreen} />
      <HistoryStack.Screen name="PDFDetail" component={PDFDetailScreen} />
      <HistoryStack.Screen name="ManagePages" component={ManagePagesScreen} />
    </HistoryStack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#6d7a96',
          tabBarInactiveTintColor: theme.colors.textLight,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
          },
        }}
      >
        <Tab.Screen
          name="Convert"
          component={ConvertScreen}
          options={{
            tabBarLabel: 'Convert',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="picture-as-pdf" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="HistoryStack"
          component={HistoryNavigator}
          options={{
            tabBarLabel: 'History',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="history" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
