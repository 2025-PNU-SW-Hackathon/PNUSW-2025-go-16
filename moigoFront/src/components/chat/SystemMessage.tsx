import React from 'react';
import { View, Text } from 'react-native';
import type { SystemMessageType } from '@/types/ChatTypes';

interface SystemMessageProps {
  message: string;
  messageType: SystemMessageType;
  userName?: string;
  userId?: string;
  kickedBy?: string;
  paymentId?: string;
  paymentProgress?: {
    completed: number;
    total: number;
    is_fully_completed: boolean;
  };
}

export default function SystemMessage({ 
  message, 
  messageType, 
  userName, 
  userId, 
  kickedBy,
  paymentId,
  paymentProgress
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
      case 'payment_started':
        return {
          backgroundColor: '#fef3c7', // 연한 주황색
          textColor: '#d97706' // 진한 주황색
        };
      case 'payment_completed':
        return {
          backgroundColor: '#d1fae5', // 연한 초록색
          textColor: '#059669' // 진한 초록색
        };
      case 'system_payment_start':
        return {
          backgroundColor: '#e3f2fd', // 연한 파란색
          textColor: '#1976d2' // 진한 파란색
        };
      case 'system_payment_update':
        return {
          backgroundColor: '#fff3e0', // 연한 주황색
          textColor: '#f57c00' // 진한 주황색
        };
      case 'system_payment_completed':
        return {
          backgroundColor: '#e8f5e8', // 연한 초록색
          textColor: '#388e3c' // 진한 초록색
        };
      default:
        return {
          backgroundColor: '#f3f4f6', // 기본 회색
          textColor: '#6b7280' // 기본 회색 텍스트
        };
    }
  };

  const style = getMessageStyle();

  // 정산 관련 메시지는 간단한 알림 메시지로만 표시
  if (messageType === 'system_payment_start' || messageType === 'system_payment_update' || messageType === 'system_payment_completed') {
    let simpleMessage = '';
    
    switch (messageType) {
      case 'system_payment_start':
        simpleMessage = '💰 정산이 시작되었습니다!';
        break;
      case 'system_payment_update':
        simpleMessage = `📊 입금 현황이 업데이트되었습니다`;
        if (paymentProgress) {
          simpleMessage += ` (${paymentProgress.completed}/${paymentProgress.total}명 완료)`;
        }
        break;
      case 'system_payment_completed':
        simpleMessage = '✅ 모든 참여자의 입금이 완료되었습니다!';
        break;
    }

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
            {simpleMessage}
          </Text>
        </View>
      </View>
    );
  }

  // 기존 시스템 메시지는 기본 스타일로 렌더링
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
