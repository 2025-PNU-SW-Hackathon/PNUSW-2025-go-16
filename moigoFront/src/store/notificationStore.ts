import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 알림 아이템 타입 정의
export interface NotificationItem {
  id: string;
  type: 'CHAT_MESSAGE' | 'PAYMENT_REQUEST' | 'RESERVATION_CONFIRMED' | 'RESERVATION_REJECTED' | 'RESERVATION_CANCELED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'REFUND_COMPLETED' | 'RESERVATION_REQUESTED' | 'PAYOUT_COMPLETED';
  title: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  data: any; // 원본 푸시 데이터
}

// 알림 Store 타입
interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

// 알림 타입별 아이콘 반환
export const getNotificationIcon = (type: NotificationItem['type']): string => {
  switch (type) {
    case 'CHAT_MESSAGE':
      return 'message-circle';
    case 'PAYMENT_REQUEST':
    case 'PAYMENT_SUCCESS':
    case 'PAYMENT_FAILED':
      return 'credit-card';
    case 'RESERVATION_CONFIRMED':
    case 'RESERVATION_REQUESTED':
      return 'check-circle';
    case 'RESERVATION_REJECTED':
    case 'RESERVATION_CANCELED':
      return 'x-circle';
    case 'REFUND_COMPLETED':
    case 'PAYOUT_COMPLETED':
      return 'dollar-sign';
    default:
      return 'bell';
  }
};

// 알림 타입별 색상 반환
export const getNotificationColor = (type: NotificationItem['type']): string => {
  switch (type) {
    case 'CHAT_MESSAGE':
      return '#3B82F6'; // 파란색
    case 'PAYMENT_REQUEST':
    case 'PAYMENT_FAILED':
      return '#EF4444'; // 빨간색
    case 'PAYMENT_SUCCESS':
    case 'RESERVATION_CONFIRMED':
      return '#10B981'; // 초록색
    case 'RESERVATION_REJECTED':
    case 'RESERVATION_CANCELED':
      return '#F59E0B'; // 주황색
    case 'REFUND_COMPLETED':
    case 'PAYOUT_COMPLETED':
      return '#8B5CF6'; // 보라색
    case 'RESERVATION_REQUESTED':
      return '#06B6D4'; // 하늘색
    default:
      return '#6B7280'; // 회색
  }
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: NotificationItem = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          isRead: false,
        };

        set((state) => {
          const newNotifications = [newNotification, ...state.notifications];
          const unreadCount = newNotifications.filter(n => !n.isRead).length;
          
          return {
            notifications: newNotifications,
            unreadCount,
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
          );
          const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
          
          return {
            notifications: updatedNotifications,
            unreadCount,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            isRead: true,
          })),
          unreadCount: 0,
        }));
      },

      deleteNotification: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.filter(n => n.id !== id);
          const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
          
          return {
            notifications: updatedNotifications,
            unreadCount,
          };
        });
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      getUnreadCount: () => {
        return get().notifications.filter(n => !n.isRead).length;
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // timestamp를 Date 객체로 복원
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.notifications = state.notifications.map(notification => ({
            ...notification,
            timestamp: new Date(notification.timestamp),
          }));
          state.unreadCount = state.notifications.filter(n => !n.isRead).length;
        }
      },
    }
  )
);
