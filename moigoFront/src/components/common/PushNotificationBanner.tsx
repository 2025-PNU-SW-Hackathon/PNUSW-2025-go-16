import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform, StatusBar } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';

interface PushNotificationBannerProps {
  visible: boolean;
  title: string;
  body: string;
  onPress: () => void;
  onDismiss: () => void;
  duration?: number;
  icon?: keyof typeof Feather.glyphMap;
}

export default function PushNotificationBanner({
  visible,
  title,
  body,
  onPress,
  onDismiss,
  duration = 4000,
  icon = 'bell'
}: PushNotificationBannerProps) {
  // StatusBar 높이 + 여백 계산
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
  const slideAnim = new Animated.Value(-100);
  const fadeAnim = new Animated.Value(0);
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 배너 나타나기
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 자동으로 사라지기
      const timer = setTimeout(() => {
        hideBanner();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideBanner = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(panY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  // 팬 제스처 핸들러
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: panY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      const { translationY, velocityY } = nativeEvent;
      
      // 위로 드래그하거나 빠르게 스와이프한 경우 숨기기
      if (translationY < -50 || velocityY < -500) {
        // 위로 사라지는 애니메이션
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -200,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss();
        });
      } else {
        // 원래 위치로 복귀
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { translateY: panY }
        ],
        paddingTop: statusBarHeight,
      }}
      className="absolute top-0 left-0 right-0 z-50"
    >
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View>
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="mx-4 mt-2 bg-white rounded-xl shadow-lg border border-gray-100"
            style={{ elevation: 10 }}
          >
        <View className="p-4">
          <View className="flex-row items-start">
            {/* 아이콘 */}
            <View className="w-8 h-8 bg-mainOrange rounded-full items-center justify-center mr-3 mt-0.5">
              <Feather name={icon} size={16} color="white" />
            </View>

            {/* 내용 */}
            <View className="flex-1 mr-2">
              <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={1}>
                {title}
              </Text>
              <Text className="text-sm text-gray-600" numberOfLines={2}>
                {body}
              </Text>
            </View>

            {/* 닫기 버튼 */}
            <TouchableOpacity
              onPress={hideBanner}
              className="w-6 h-6 items-center justify-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
}
