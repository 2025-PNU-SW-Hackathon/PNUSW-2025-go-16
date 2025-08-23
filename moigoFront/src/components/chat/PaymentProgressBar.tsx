import React from 'react';
import { View, Text } from 'react-native';

interface PaymentProgressBarProps {
  completed: number;
  total: number;
  isCompleted: boolean;
  style?: 'default' | 'compact';
}

export default function PaymentProgressBar({ 
  completed, 
  total, 
  isCompleted,
  style = 'default'
}: PaymentProgressBarProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  if (style === 'compact') {
    return (
      <View className="flex-row items-center">
        <View className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden mr-2">
          <View 
            className="h-full rounded-full transition-all"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: isCompleted ? '#059669' : '#f57c00'
            }}
          />
        </View>
        <Text 
          className="text-xs font-medium"
          style={{ color: isCompleted ? '#059669' : '#f57c00' }}
        >
          {completed}/{total}
        </Text>
      </View>
    );
  }
  
  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-medium text-gray-700">
          입금 진행률
        </Text>
        <Text 
          className="text-sm font-bold"
          style={{ color: isCompleted ? '#059669' : '#f57c00' }}
        >
          {completed}/{total}명 {isCompleted ? '완료' : '대기중'}
        </Text>
      </View>
      
      <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <View 
          className="h-full rounded-full transition-all"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: isCompleted ? '#059669' : '#f57c00'
          }}
        />
      </View>
      
      {isCompleted && (
        <Text className="text-xs text-green-600 mt-1 text-center">
          🎉 모든 참여자가 입금을 완료했습니다!
        </Text>
      )}
    </View>
  );
}
