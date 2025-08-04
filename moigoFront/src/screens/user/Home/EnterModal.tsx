import { View, Text, TextInput } from 'react-native';
import { COLORS } from '@/constants/colors';

import ModalBox from '@/components/common/ModalBox';
import PrimaryButton from '@/components/common/PrimaryButton';
import Toast from '@/components/common/Toast';

import { useEnterModal } from '@/hooks/useEnterModal';

interface EnterModalProps {
  visible: boolean;
  onClose: () => void;
  event?: any;
  showSuccessToast: (message: string) => void;
  showErrorToast: (message: string) => void;
}

function EnterModal({ visible, onClose, event, showSuccessToast, showErrorToast }: EnterModalProps) {
  const { 
    message, 
    setMessage, 
    handleConfirm, 
    handleCancel, 
    isLoading
  } = useEnterModal();

  if (!event) return null;

  return (
    <>
      <ModalBox visible={visible} title="모임 참여하기" onClose={onClose}>
        <View className="mb-4">
          {/* 이벤트 정보 */}
          <View className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-gray-800">
              {event.title || event.reservation_match || event.reservation_bio}
            </Text>
            <View>
              <Text className="mb-2 text-gray-600">
                시간: {event.time || new Date(event.reservation_start_time).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </Text>
              <Text className="mb-2 text-gray-600">
                장소: {event.location || event.reservation_store_name || '위치 정보 없음'}
              </Text>
              <Text className="text-gray-600">
                현재 참여: {event.participants || `${event.reservation_participant_cnt}/${event.reservation_max_participant_cnt}명`}
              </Text>
            </View>
          </View>

          {/* 메시지 입력 */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-gray-700">메시지 (선택)</Text>
            <TextInput
              className="p-4 w-full text-base bg-gray-100 rounded-lg"
              placeholder="간단한 메시지를 남겨주세요"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* 버튼들 */}
          <View className="flex-row">
            <PrimaryButton
              title={isLoading ? "참여 중..." : "참여 확정"}
              onPress={() => handleConfirm(event, onClose, showSuccessToast, showErrorToast)}
              color={COLORS.mainOrange}
              className="flex-1 mr-3"
              disabled={isLoading}
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
    </>
  );
}

export default EnterModal;
