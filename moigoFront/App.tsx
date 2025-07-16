import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import "./global.css"

export default function App() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black">
      <Text className="mb-4 text-2xl font-bold text-black dark:text-white">ddd</Text>
      <StatusBar style="auto" />
    </View>
  );
}
