import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide: () => void;
  duration?: number;
}

export default function Toast({ 
  visible, 
  message, 
  type = 'success', 
  onHide, 
  duration = 3000 
}: ToastProps) {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      // 토스트 나타나기
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 자동으로 사라지기
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check';
      case 'error':
        return 'x';
      case 'info':
        return 'info';
      default:
        return 'check';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className={`absolute right-4 left-4 bottom-8 z-50 p-4 rounded-lg shadow-lg ${getToastStyle()}`}
    >
      <View className="flex-row items-center">
        <Feather 
          name={getIcon() as any} 
          size={20} 
          color="white" 
          className="mr-3"
        />
        <Text className="flex-1 text-base font-medium text-white">
          {message}
        </Text>
        <Feather 
          name="x" 
          size={20} 
          color="white" 
          onPress={hideToast}
        />
      </View>
    </Animated.View>
  );
} 