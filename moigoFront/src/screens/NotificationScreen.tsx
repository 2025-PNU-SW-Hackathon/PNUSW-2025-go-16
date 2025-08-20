import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useNotificationStore, getNotificationIcon, getNotificationColor } from '@/store/notificationStore';
import type { NotificationItem } from '@/store/notificationStore';

// 시간 포맷팅 함수
const formatTime = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  
  return timestamp.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
};

// 개별 알림 아이템 컴포넌트
interface NotificationItemProps {
  notification: NotificationItem;
  onPress: () => void;
  onDelete: () => void;
}

function NotificationItemComponent({ notification, onPress, onDelete }: NotificationItemProps) {
  const iconName = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row p-4 border-b border-gray-100 ${!notification.isRead ? 'bg-blue-50' : 'bg-white'}`}
      activeOpacity={0.7}
    >
      {/* 읽지 않은 알림 표시 점 */}
      {!notification.isRead && (
        <View className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
      )}
      
      {/* 아이콘 */}
      <View 
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: iconColor + '20' }}
      >
        <Feather name={iconName as any} size={20} color={iconColor} />
      </View>

      {/* 알림 내용 */}
      <View className="flex-1">
        <Text className={`text-base ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
          {notification.title}
        </Text>
        <Text className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text className="text-xs text-gray-400 mt-2">
          {formatTime(notification.timestamp)}
        </Text>
      </View>

      {/* 삭제 버튼 */}
      <TouchableOpacity
        onPress={onDelete}
        className="p-2 ml-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="x" size={16} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function NotificationScreen() {
  const navigation = useNavigation();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotificationStore();

  // 알림 클릭 처리
  const handleNotificationPress = (notification: NotificationItem) => {
    // 읽음 처리
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // TODO: 알림 타입별 네비게이션 처리
    // 현재는 단순히 뒤로가기
    navigation.goBack();
  };

  // 알림 삭제 처리
  const handleDeleteNotification = (notification: NotificationItem) => {
    Alert.alert(
      '알림 삭제',
      '이 알림을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => deleteNotification(notification.id) 
        },
      ]
    );
  };

  // 전체 삭제 처리
  const handleClearAll = () => {
    Alert.alert(
      '전체 삭제',
      '모든 알림을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '전체 삭제', 
          style: 'destructive',
          onPress: clearAll 
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <Feather name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">알림</Text>
          {unreadCount > 0 && (
            <View className="ml-2 px-2 py-1 bg-red-500 rounded-full">
              <Text className="text-xs font-bold text-white">{unreadCount}</Text>
            </View>
          )}
        </View>

        {/* 헤더 액션 버튼들 */}
        <View className="flex-row">
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="px-3 py-1 mr-2"
            >
              <Text className="text-sm font-medium text-blue-600">모두 읽음</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Feather name="trash-2" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 알림 목록 */}
      {notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <Feather name="bell" size={64} color="#D1D5DB" />
          <Text className="text-lg font-medium text-gray-500 mt-4">알림이 없습니다</Text>
          <Text className="text-sm text-gray-400 text-center mt-2">
            새로운 알림이 오면 여기에 표시됩니다
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <NotificationItemComponent
              key={notification.id}
              notification={notification}
              onPress={() => handleNotificationPress(notification)}
              onDelete={() => handleDeleteNotification(notification)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
