import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import './global.css';
import Test from '@/Test';

export default function App() {
  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black">
      <Test />
      <StatusBar style="auto" />
    </View>
  );
}
