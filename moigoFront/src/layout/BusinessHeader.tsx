import { View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
// test
interface BusinessHeaderProps {
  currentScreen?: string;
}

export default function BusinessHeader({ currentScreen }: BusinessHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  return (
    <SafeAreaView edges={['top']} className="">
      <View className="flex-row justify-between items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
        <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
          <Image
            source={require('@/assets/moigoLogo.png')}
            style={{ width: 35, height: 35, resizeMode: 'contain' }}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="p-2 bg-gray-700 rounded-full"
          onPress={() => navigation.navigate('Notification')}
        >
          <Feather 
            name="bell" 
            size={20} 
            color="#ffffff" 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
