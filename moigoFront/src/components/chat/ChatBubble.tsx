import React from 'react';
import { View, Text } from 'react-native';

interface ChatBubbleProps {
  message: string;
  isMyMessage: boolean;
  senderName?: string;
  senderAvatar?: string; // 아바타 텍스트 (예: '참', '방')
}

export default function ChatBubble({ 
  message, 
  isMyMessage, 
  senderName, 
  senderAvatar 
}: ChatBubbleProps) {
  return (
    <View className={`mb-4 ${isMyMessage ? 'self-end' : 'self-start'}`}>
      {!isMyMessage ? (
        <View className="flex-row items-start">
          {/* 프로필 아바타 */}
          <View className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center mr-2">
            {/* 여기에 이미지 나중에 넣어야함. */}
            <Text className="text-xs font-bold text-gray-700">
              {senderAvatar || '참'}
            </Text>
          </View>
          
          <View className="flex-col">
            <Text className="text-sm font-semibold text-gray-800 mb-1">
              {senderName || '사용자'}
            </Text>
            
            <View className="rounded-2xl px-4 py-3 max-w-[280px] bg-gray150">
              <Text 
                className="text-sm leading-5 text-gray-800"
                numberOfLines={0} // 자동 줄바꿈
              >
                {message}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        /* 내 메시지 */
        <View className="rounded-2xl px-4 py-3 max-w-[280px] bg-mainOrange">
          <Text 
            className="text-sm leading-5 text-white"
            numberOfLines={0} // 자동 줄바꿈
          >
            {message}
          </Text>
        </View>
      )}
    </View>
  );
} 