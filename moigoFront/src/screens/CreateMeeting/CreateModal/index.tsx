import React from 'react';
import { Modal, TouchableOpacity, ScrollView } from 'react-native';
import { events } from '@/mocks/events';
import ModalHeader from './ModalHeader';
import ReservationInfo from './ReservationInfo';
import ModalButtons from './ModalButtons';

interface CreateModalProps {
  isConfirmModalVisible: boolean;
  setIsConfirmModalVisible: (visible: boolean) => void;
  selectedEventId: string;
  maxPeople: number;
  meetingName: string;
  description: string;
  handleConfirmRegistration: () => void;
}

// 메인 모달 컴포넌트
export default function CreateModal({
  isConfirmModalVisible,
  setIsConfirmModalVisible,
  selectedEventId,
  maxPeople,
  meetingName,
  description,
  handleConfirmRegistration,
}: CreateModalProps) {
  const selectedEvent = events.find((event) => event.id === selectedEventId);

  const handleCancel = () => {
    setIsConfirmModalVisible(false);
  };

  const handleConfirm = () => {
    handleConfirmRegistration();
  };

  return (
    <Modal visible={isConfirmModalVisible} transparent animationType="fade">
      <TouchableOpacity
        className="justify-end flex-1 bg-black/50"
        activeOpacity={1}
        onPress={handleCancel}
      >
        <TouchableOpacity
          className="w-full bg-white rounded-t-3xl min-h-[55%] max-h-[80%]"
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <ModalHeader onClose={handleCancel} />

          {/* 스크롤 가능한 컨텐츠 */}
          <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
            {/* 예약 정보 */}
            {selectedEvent && (
              <ReservationInfo selectedEvent={selectedEvent} maxPeople={maxPeople} />
            )}

            {/* 버튼 영역 */}
            <ModalButtons onCancel={handleCancel} onConfirm={handleConfirm} />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
