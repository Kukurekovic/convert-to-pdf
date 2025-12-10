import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConvertScreen from '../screens/ConvertScreen';
import HistoryScreen from '../screens/HistoryScreen';
import PDFDetailScreen from '../screens/PDFDetailScreen';
import ManagePagesScreen from '../screens/ManagePagesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FloatingTabBar from '../components/FloatingTabBar';
import i18n from '../i18n';
import type { RootTabParamList, HistoryStackParamList } from '../types/navigation';

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

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Convert"
        component={ConvertScreen}
        options={{
          tabBarLabel: i18n.t('tabs.convert'),
        }}
      />
      <Tab.Screen
        name="HistoryStack"
        component={HistoryNavigator}
        options={{
          tabBarLabel: i18n.t('tabs.history'),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: i18n.t('tabs.settings'),
        }}
      />
    </Tab.Navigator>
  );
}
