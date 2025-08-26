import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import StoreShareMessage from './StoreShareMessage';
import SystemMessage from './SystemMessage';
import HostBadge from './HostBadge';
import type { SystemMessageType, MessageStatus } from '@/types/ChatTypes';
import Feather from 'react-native-vector-icons/Feather';

interface ChatBubbleProps {
  messages: Array<{
    id: string;
    type: 'text' | 'store' | 'store_share' | 'system';
    content: string;
    storeInfo?: any;
    status?: MessageStatus; // 메시지 상태 추가
    // 시스템 메시지 관련 필드
    message_type?: SystemMessageType;
    user_name?: string;
    user_id?: string;
    kicked_by?: string;
    // 가게 공유 메시지 관련 필드
    store_id?: string;
  }>; // 메시지 배열 (타입과 내용 포함)
  isMyMessage: boolean;
  senderName?: string;
  senderAvatar?: string; // 아바타 텍스트 (예: '참', '방')
  onRetryMessage?: (messageId: string) => void; // 재시도 콜백 추가
  // 네비게이션을 위한 추가 props
  chatRoom?: any;
  isHost?: boolean;
}

// 메시지 상태 아이콘 컴포넌트
const MessageStatusIcon = ({ status }: { status?: MessageStatus }) => {
  // console.log('🎯 MessageStatusIcon 렌더링:', status);
  
  if (!status) {
    // console.log('⚠️ 상태가 없어서 아이콘 표시 안 함');
    return null;
  }

  switch (status) {
    case 'sending':
      return (
        <View className="flex-row items-center ml-2">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <View className="w-2 h-2 rounded-full bg-orange-400 animate-pulse ml-1" />
            <View className="w-2 h-2 rounded-full bg-orange-400 animate-pulse ml-1" />
          </View>
          <Text className="text-xs text-orange-600 ml-2 font-medium">전송 중</Text>
        </View>
      );
    case 'sent':
      return (
        <View className="ml-2">
          <Feather name="check" size={12} color="#9CA3AF" />
        </View>
      );
    case 'delivered':
      return (
        <View className="ml-2">
          <Feather name="check-circle" size={12} color="#3B82F6" />
        </View>
      );
    case 'read':
      return (
        <View className="ml-2">
          <Feather name="check-circle" size={12} color="#10B981" />
        </View>
      );
    case 'failed':
      return (
        <View className="flex-row items-center ml-2">
          <Feather name="alert-circle" size={12} color="#EF4444" />
          <Text className="text-xs text-red-500 ml-1">실패 (재시도)</Text>
        </View>
      );
    default:
      return null;
  }
};

export default function ChatBubble({ 
  messages, 
  isMyMessage, 
  senderName, 
  senderAvatar,
  onRetryMessage,
  chatRoom,
  isHost
}: ChatBubbleProps) {
  // 🔍 렌더링 디버깅
  // console.log('📱 ChatBubble 렌더링:', {
  //   messageCount: messages.length,
  //   isMyMessage,
  //   senderName,
  //   messageTypes: messages.map(m => m.type),
  //   hasStoreShare: messages.some(m => m.type === 'store_share')
  // });

  // 시스템 메시지인지 확인
  const isSystemMessage = messages.length > 0 && messages[0].type === 'system';
  
  // 시스템 메시지인 경우 SystemMessage 컴포넌트로 렌더링
  if (isSystemMessage) {
    const systemMessage = messages[0];
    return (
      <SystemMessage
        message={systemMessage.content}
        messageType={systemMessage.message_type || 'system_join'}
        userName={systemMessage.user_name}
        userId={systemMessage.user_id}
        kickedBy={systemMessage.kicked_by}
      />
    );
  }

  return (
    <View className={`mb-4 ${isMyMessage ? 'self-end' : 'self-start'}`}>
      {!isMyMessage ? (
        <View className="flex-row items-start">
          {/* 프로필 아바타 - senderAvatar가 있을 때만 표시 */}
          {senderAvatar && (
            <View className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center mr-2">
              {/* 여기에 이미지 나중에 넣어야함. */}
              <Text className="text-xs font-bold text-gray-700">
                {senderAvatar}
              </Text>
            </View>
          )}
          
          <View className="flex-col">
            {/* 프로필 이름 - senderName이 있을 때만 표시 */}
            {senderName && (
              <View className="flex-row items-center mb-1">
                <Text className="text-sm font-semibold text-gray-800 mr-2">
                  {senderName}
                </Text>
              </View>
            )}
            
            {/* 메시지들을 순서대로 렌더링 */}
            {messages.map((message, index) => {
              if (message.type === 'text') {
                return (
                  <View 
                    key={`other-text-${message.id}-${index}`}
                    className={`rounded-2xl px-4 py-3 bg-gray-100 self-start ${
                      index > 0 ? 'mt-2' : ''
                    }`}
                    style={{ maxWidth: 280 }}
                  >
                    <Text 
                      className="text-sm leading-5 text-gray-600"
                      numberOfLines={0} // 자동 줄바꿈
                    >
                      {message.content}
                    </Text>
                  </View>
                );
              } else if ((message.type === 'store' || message.type === 'store_share') && message.storeInfo) {
                return (
                  <View key={`other-store-${message.id}-${index}`} className={index > 0 ? 'mt-2' : ''}>
                    <StoreShareMessage
                      isMyMessage={isMyMessage}
                      senderName={undefined} // 이미 위에서 표시했으므로
                      senderAvatar={undefined} // 이미 위에서 표시했으므로
                      storeInfo={message.storeInfo}
                      storeId={message.store_id}
                      chatRoom={chatRoom}
                      isHost={isHost}
                    />
                  </View>
                );
              }
              return null;
            })}
          </View>
        </View>
      ) : (
        /* 내 메시지 */
        <View>
          {/* 메시지들을 순서대로 렌더링 */}
          {messages.map((message, index) => {
            if (message.type === 'text') {
              return (
                <View key={`my-text-${message.id}-${index}`} className={index > 0 ? 'mt-2' : ''}>
                  <View className="flex-row items-end justify-end">
                    {/* 📱 카카오톡 스타일: 메시지 상태 표시 */}
                    <TouchableOpacity 
                      onPress={() => {
                        if (message.status === 'failed' && onRetryMessage) {
                          onRetryMessage(message.id);
                        }
                      }}
                      disabled={message.status !== 'failed'}
                    >
                      <MessageStatusIcon status={message.status} />
                    </TouchableOpacity>
                    
                    <View 
                      className={`rounded-2xl px-4 py-3 ml-2 ${
                        message.status === 'failed' ? 'bg-red-400' : 'bg-mainOrange'
                      }`}
                      style={{ maxWidth: 280 }}
                    >
                      <Text 
                        className="text-sm leading-5 text-white"
                        numberOfLines={0} // 자동 줄바꿈
                      >
                        {message.content}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            } else if ((message.type === 'store' || message.type === 'store_share') && message.storeInfo) {
              return (
                <View key={`my-store-${message.id}-${index}`} className={index > 0 ? 'mt-2' : ''}>
                  <View className="flex-row items-end justify-end">
                    {/* 가게 공유 메시지에도 상태 표시 */}
                    <MessageStatusIcon status={message.status} />
                    
                    <View className="ml-2">
                      <StoreShareMessage
                        isMyMessage={isMyMessage}
                        senderName={undefined} // 내 메시지는 프로필 표시 안함
                        senderAvatar={undefined} // 내 메시지는 프로필 표시 안함
                        storeInfo={message.storeInfo}
                        storeId={message.store_id}
                        chatRoom={chatRoom}
                        isHost={isHost}
                      />
                    </View>
                  </View>
                </View>
              );
            }
            return null;
          })}
        </View>
      )}
    </View>
  );
} 