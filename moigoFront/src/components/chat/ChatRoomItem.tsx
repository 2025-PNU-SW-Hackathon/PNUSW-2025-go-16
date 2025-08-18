import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChatRoom } from '@/types/ChatTypes';

interface ChatRoomItemProps {
  chatRoom: ChatRoom;
  onPress: (chatRoom: ChatRoom) => void;
}

export default function ChatRoomItem({ chatRoom, onPress }: ChatRoomItemProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(chatRoom)}
      activeOpacity={0.7}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm"
    >
      <View className="flex-row items-start">
        {/* 아이콘 */}
        <View 
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: chatRoom.icon.backgroundColor }}
        >
          <Text 
            className="text-xs font-bold text-center leading-tight"
            style={{ color: chatRoom.icon.textColor }}
            numberOfLines={2}
          >
            {chatRoom.icon.text}
          </Text>
        </View>

        {/* 채팅방 정보 */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-semibold text-gray-900 flex-1">
              {chatRoom.title}
            </Text>
            <Text className="text-xs text-gray-500 ml-2">
              {chatRoom.timestamp}
            </Text>
          </View>
          
          <Text className="text-sm text-gray-600 mb-1">
            {chatRoom.subtitle}
          </Text>
          
          <View className="flex-row items-center justify-between">
            <Text 
              className="text-sm text-gray-700 flex-1 mr-2"
              numberOfLines={1}
            >
              {chatRoom.lastMessage}
            </Text>
            
            {/* 읽지 않은 메시지 수 */}
            {chatRoom.unreadCount > 0 && (
              <View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                <Text className="text-xs text-white font-bold">
                  {chatRoom.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
} 