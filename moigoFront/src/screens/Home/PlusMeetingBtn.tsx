import { TouchableOpacity, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useHomeScreen } from '@/hooks/useHomeScreen';

function PlusMeetingBtn() {
  const { setIsFilterModalVisible } = useHomeScreen();

  return (
    <TouchableOpacity
      className="absolute items-center justify-center rounded-full shadow-lg right-6 bottom-6 w-14 h-14 bg-mainOrange"
      onPress={() => Alert.alert('새 이벤트', '새 이벤트를 만드시겠습니까?')}
    >
      <Feather name="plus" size={24} color="white" />
    </TouchableOpacity>
  );
}
export default PlusMeetingBtn;
