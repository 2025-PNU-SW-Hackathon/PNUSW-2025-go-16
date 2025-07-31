import { View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

export default function Header() {
  return (
    <SafeAreaView edges={['top']} className="bg-white">
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
        <Image
          source={require('@/assets/moigoLogo.png')}
          style={{ width: 35, height: 35, resizeMode: 'contain' }}
        />
        <TouchableOpacity className="p-2 rounded-full bg-mainGray">
          <Feather name="bell" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
