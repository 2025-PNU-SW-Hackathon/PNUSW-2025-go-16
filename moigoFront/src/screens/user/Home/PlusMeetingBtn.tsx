import { TouchableOpacity, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useHomeScreen } from '@/hooks/useHomeScreen';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';

function PlusMeetingBtn() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setIsFilterModalVisible } = useHomeScreen();

  return (
    <TouchableOpacity
      className="absolute items-center justify-center rounded-full shadow-lg right-6 bottom-6 w-14 h-14 bg-mainOrange"
      onPress={() => navigation.navigate('CreateMeeting')}
    >
      <Feather name="plus" size={24} color="white" />
    </TouchableOpacity>
  );
}
export default PlusMeetingBtn;
