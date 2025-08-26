import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChatRoom } from '@/types/ChatTypes';
import { formatTimeAgo } from '@/utils/dateUtils';

interface ChatRoomItemProps {
  chatRoom: ChatRoom;
  onPress: (chatRoom: ChatRoom) => void;
}

export default function ChatRoomItem({ chatRoom, onPress }: ChatRoomItemProps) {
  // 채팅방 이름에서 첫 글자 추출
  const getIconText = () => {
    return (chatRoom.title || chatRoom.name || '채팅').charAt(0);
  };

  // 시간 포맷팅 - timestamp가 이미 포맷된 상태로 제공됨
  const timeAgo = chatRoom.timestamp || '시간 없음';

  // 읽지 않은 메시지 수 (임시로 랜덤 설정)
  const unreadCount = chatRoom.unreadCount || (Math.random() > 0.5 ? 2 : 0);

    return (
    <TouchableOpacity
      onPress={() => onPress(chatRoom)}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-4 my-2 bg-white rounded-2xl border border-gray-200 shadow-sm"
    >
      {/* 왼쪽 아이콘 */}
      <View className="justify-center items-center mr-3 w-12 h-12 bg-orange-500 rounded-full">
        <Text className="text-lg font-semibold text-white">{getIconText()}</Text>
      </View>
      
      {/* 중간 내용 */}
      <View className="flex-1 mr-2">
        <View className="flex-row justify-between items-center">
            <Text className="text-base font-semibold text-black" numberOfLines={1}>
              {chatRoom.title || chatRoom.name}
            </Text>
            <Text className="text-xs text-gray-400">{timeAgo}</Text>
        </View>
          <View className="flex-1">
            <Text className="mt-1 text-sm text-gray-500" numberOfLines={1}>
              참여자 {(chatRoom as any).reservation_participant_cnt || 0}명
            </Text>
          </View>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="flex-1 text-sm text-gray-500" numberOfLines={1}>
            {chatRoom.lastMessage || '메시지가 없습니다.'}
          </Text>
          {/* 오른쪽 읽지 않은 메시지 카운트 */}
          {unreadCount > 0 && (
            <View className="bg-red-500 rounded-full min-w-[20px] h-5 justify-center items-center px-1.5 ml-2">
              <Text className="text-xs font-semibold text-white">{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
} 