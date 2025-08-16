import React from 'react';
import { View, Text } from 'react-native';
import type { SystemMessageType } from '@/types/ChatTypes';

interface SystemMessageProps {
  message: string;
  messageType: SystemMessageType;
  userName?: string;
  userId?: string;
  kickedBy?: string;
}

export default function SystemMessage({ 
  message, 
  messageType, 
  userName, 
  userId, 
  kickedBy 
}: SystemMessageProps) {
  // 메시지 타입별 스타일 및 이모지 설정
  const getMessageStyle = () => {
    switch (messageType) {
      case 'system_join':
        return {
          backgroundColor: '#f0f9ff', // 연한 파란색
          textColor: '#0369a1' // 진한 파란색
        };
      case 'system_leave':
        return {
          backgroundColor: '#fef3c7', // 연한 주황색
          textColor: '#d97706' // 진한 주황색
        };
      case 'system_kick':
        return {
          backgroundColor: '#fee2e2', // 연한 빨간색
          textColor: '#dc2626' // 진한 빨간색
        };
      default:
        return {
          backgroundColor: '#f3f4f6', // 기본 회색
          textColor: '#6b7280' // 기본 회색 텍스트
        };
    }
  };

  const style = getMessageStyle();

  return (
    <View className="my-2 items-center">
      <View 
        className="px-4 py-2 rounded-full"
        style={{ backgroundColor: style.backgroundColor }}
      >
        <Text 
          className="text-xs font-medium text-center"
          style={{ color: style.textColor }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}
