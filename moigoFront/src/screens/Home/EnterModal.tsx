import { View, Text, TextInput } from 'react-native';
import { COLORS } from '@/constants/colors';

import ModalBox from '@/components/common/ModalBox';
import PrimaryButton from '@/components/common/PrimaryButton';

import { useEnterModal } from '@/hooks/useEnterModal';

interface EnterModalProps {
  visible: boolean;
  onClose: () => void;
  event?: any;
}

function EnterModal({ visible, onClose, event }: EnterModalProps) {
  const { message, setMessage, handleConfirm, handleCancel } = useEnterModal();

  if (!event) return null;

  return (
    <ModalBox visible={visible} title="모임 참여하기" onClose={onClose}>
      <View className="mb-4">
        {/* 이벤트 정보 */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-semibold text-gray-800">{event.title}</Text>
          <View className="gap-2 space-y-2">
            <Text className="text-gray-600">시간: {event.time}</Text>
            <Text className="text-gray-600">장소: {event.location}</Text>
            <Text className="text-gray-600">현재 참여: {event.participants}</Text>
          </View>
        </View>

        {/* 메시지 입력 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-700">메시지 (선택)</Text>
          <TextInput
            className="w-full p-4 text-base bg-gray-100 rounded-lg"
            placeholder="간단한 메시지를 남겨주세요"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 버튼들 */}
        <View className="flex-row gap-3">
          <PrimaryButton
            title="참여 확정"
            onPress={() => handleConfirm(event, onClose)}
            color={COLORS.mainOrange}
            className="flex-1"
          />
          <PrimaryButton
            title="취소"
            onPress={() => handleCancel(onClose)}
            color="#E5E7EB"
            className="flex-1"
          />
        </View>
      </View>
    </ModalBox>
  );
}

export default EnterModal;
