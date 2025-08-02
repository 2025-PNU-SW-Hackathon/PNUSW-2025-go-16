import React from 'react';
import { View, Text } from 'react-native';
import StoreShareMessage from './StoreShareMessage';

interface ChatBubbleProps {
  messages: Array<{
    id: string;
    type: 'text' | 'store';
    content: string;
    storeInfo?: any;
  }>; // 메시지 배열 (타입과 내용 포함)
  isMyMessage: boolean;
  senderName?: string;
  senderAvatar?: string; // 아바타 텍스트 (예: '참', '방')
}

export default function ChatBubble({ 
  messages, 
  isMyMessage, 
  senderName, 
  senderAvatar
}: ChatBubbleProps) {
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
              <Text className="text-sm font-semibold text-gray-800 mb-1">
                {senderName}
              </Text>
            )}
            
            {/* 메시지들을 순서대로 렌더링 */}
            {messages.map((message, index) => {
              if (message.type === 'text') {
                return (
                  <View 
                    key={message.id}
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
              } else if (message.type === 'store' && message.storeInfo) {
                return (
                  <View key={message.id} className={index > 0 ? 'mt-2' : ''}>
                    <StoreShareMessage
                      isMyMessage={isMyMessage}
                      senderName={undefined} // 이미 위에서 표시했으므로
                      senderAvatar={undefined} // 이미 위에서 표시했으므로
                      storeInfo={message.storeInfo}
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
                 <View 
                   key={message.id}
                   className={`rounded-2xl px-4 py-3 bg-mainOrange self-end ${
                     index > 0 ? 'mt-2' : ''
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
               );
             } else if (message.type === 'store' && message.storeInfo) {
               return (
                 <View key={message.id} className={index > 0 ? 'mt-2' : ''}>
                   <StoreShareMessage
                     isMyMessage={isMyMessage}
                     senderName={undefined} // 내 메시지는 프로필 표시 안함
                     senderAvatar={undefined} // 내 메시지는 프로필 표시 안함
                     storeInfo={message.storeInfo}
                   />
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