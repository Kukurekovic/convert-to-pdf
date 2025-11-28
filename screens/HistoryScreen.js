import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-800">History</Text>
        <Text className="text-base text-gray-600 mt-2">View your conversion history</Text>
      </View>
    </SafeAreaView>
  );
}
