import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
  actionText?: string;
  onActionPress?: () => void;
}

const { width } = Dimensions.get('window');

export default function Toast({ 
  visible, 
  message, 
  type = 'info', 
  duration = 3000,
  onHide,
  actionText,
  onActionPress 
}: ToastProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      // 페이드인 + 슬라이드 다운 애니메이션
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

      // 자동 숨김
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10B981',
          icon: 'check-circle',
          iconColor: '#FFFFFF'
        };
      case 'error':
        return {
          backgroundColor: '#EF4444',
          icon: 'x-circle',
          iconColor: '#FFFFFF'
        };
      case 'warning':
        return {
          backgroundColor: '#F59E0B',
          icon: 'alert-triangle',
          iconColor: '#FFFFFF'
        };
      default: // info
        return {
          backgroundColor: '#3B82F6',
          icon: 'info',
          iconColor: '#FFFFFF'
        };
    }
  };

  const toastStyle = getToastStyle();

  if (!visible) return null;

  return (
    <View className="absolute top-0 left-0 right-0 z-50" style={{ paddingTop: 60 }}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: toastStyle.backgroundColor,
          marginHorizontal: 16,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center flex-1">
            <Feather 
              name={toastStyle.icon as any} 
              size={20} 
              color={toastStyle.iconColor} 
            />
            <Text 
              className="ml-3 text-white font-medium flex-1"
              numberOfLines={2}
            >
              {message}
            </Text>
          </View>

          <View className="flex-row items-center ml-3">
            {actionText && onActionPress && (
              <TouchableOpacity
                onPress={onActionPress}
                className="px-3 py-1 bg-white bg-opacity-20 rounded-lg mr-2"
              >
                <Text className="text-white font-semibold text-sm">
                  {actionText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={hideToast} className="p-1">
              <Feather name="x" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}