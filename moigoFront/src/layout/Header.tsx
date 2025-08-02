import { View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';

interface HeaderProps {
  currentScreen?: 'home' | 'meeting' | 'chat' | 'my';
}

export default function Header({ currentScreen = 'home' }: HeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isMyScreen = currentScreen === 'my';
  
  const handleRightButtonPress = () => {
    if (isMyScreen) {
      // 설정 페이지로 이동
      navigation.navigate('MyInfoSetting');
    } else {
      // 알림 페이지로 이동
      console.log('알림 페이지로 이동');
    }
  };

  return (
    <SafeAreaView edges={['top']} className="bg-white">
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
        <Image
          source={require('@/assets/moigoLogo.png')}
          style={{ width: 35, height: 35, resizeMode: 'contain' }}
        />
        <TouchableOpacity 
          className="p-2 rounded-full bg-mainGray"
          onPress={handleRightButtonPress}
        >
          <Feather 
            name={isMyScreen ? "settings" : "bell"} 
            size={20} 
            color={COLORS.mainDarkGray} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
