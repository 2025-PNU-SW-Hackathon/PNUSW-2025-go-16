import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useEffect, useRef, useState } from 'react';

// 푸시 알림 데이터 타입 정의
interface PushNotificationData {
  type: string;
  chatId?: string;
  eventId?: string;
  reservationId?: number;
  messageId?: string;
  senderId?: string;
  senderName?: string;
  text?: string;
  amount?: number;
  dueAtISO?: string;
  timeISO?: string;
  storeName?: string;
  reason?: string;
  canceledBy?: string;
  paymentId?: string;
  refundId?: string;
  storeId?: string;
  payoutId?: string;
  meta?: any;
}

// 푸시 알림 핸들러 props
interface PushNotificationHandlerProps {
  onNavigate: (screen: string, params?: any) => void;
  onShowBanner: (title: string, body: string, onPress: () => void) => void;
  onSaveNotification?: (notification: { type: string; title: string; body: string; data: any }) => void;
  currentUserType?: 'user' | 'business' | 'sports_fan';
}

function handleRegistrationError(errorMessage: string) {
  console.warn('Push Notification Warning:', errorMessage);
  // 시뮬레이터에서는 에러를 던지지 않고 null 반환
  if (errorMessage.includes('Must use physical device')) {
    console.log('💡 시뮬레이터에서는 푸시 알림이 제한됩니다. 실제 기기에서 테스트해주세요.');
    return null;
  }
  throw new Error(errorMessage);
}

export function usePushNotifications(handlers?: PushNotificationHandlerProps) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);

  // 푸시 알림 등록
  const registerForPushNotificationsAsync = async () => {
    // Expo Go에서는 푸시 알림 기능이 제한되므로 경고만 출력하고 종료
    if (Constants.appOwnership === 'expo') {
      console.warn('푸시 알림은 개발 빌드에서만 지원됩니다. Expo Go에서는 제한됩니다.');
      return null;
    }
    
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to get push token for push notification!');
        return null;
      }
      
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      
      if (!projectId) {
        handleRegistrationError('Project ID not found');
        return null;
      }
      
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        
        console.log('Push Token:', pushTokenString);
        setExpoPushToken(pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
        return null;
      }
    } else {
      const result = handleRegistrationError('Must use physical device for push notifications');
      if (result === null) {
        return null;
      }
    }
  };

  // 푸시 알림 데이터를 파싱해서 네비게이션 처리
  const handleNotificationNavigation = (data: PushNotificationData) => {
    if (!handlers) return;

    console.log('푸시 알림 데이터:', data);

    switch (data.type) {
      case 'CHAT_MESSAGE':
        if (data.chatId) {
          handlers.onNavigate('ChatRoom', { chatId: data.chatId });
        }
        break;

      case 'PAYMENT_REQUEST':
        if (data.chatId) {
          handlers.onNavigate('ChatRoom', { chatId: data.chatId });
          // TODO: PaymentModal 자동 열기 로직 추가 필요
        }
        break;

      case 'RESERVATION_CONFIRMED':
      case 'RESERVATION_REJECTED':
      case 'RESERVATION_CANCELED':
        if (data.eventId) {
          handlers.onNavigate('Meeting', { eventId: data.eventId });
        } else if (data.chatId) {
          handlers.onNavigate('ChatRoom', { chatId: data.chatId });
        }
        break;

      case 'PAYMENT_SUCCESS':
      case 'PAYMENT_FAILED':
        if (data.chatId) {
          handlers.onNavigate('ChatRoom', { chatId: data.chatId });
        }
        break;

      case 'REFUND_COMPLETED':
        handlers.onNavigate('ParticipatedMatches', {});
        break;

      // 사업자용 알림
      case 'RESERVATION_REQUESTED':
      case 'PAYOUT_COMPLETED':
        if (handlers.currentUserType === 'business') {
          handlers.onNavigate('Main', {});
        }
        break;

      default:
        console.log('알 수 없는 푸시 알림 타입:', data.type);
    }
  };

  // 포그라운드에서 알림 수신 시 배너 표시
  const handleForegroundNotification = (notification: Notifications.Notification) => {
    if (!handlers) return;

    const { title, body, data } = notification.request.content;
    const notificationData = data as unknown as PushNotificationData;

    console.log('포그라운드 알림 수신:', { title, body, data });

    // 알림을 Store에 저장
    if (handlers.onSaveNotification) {
      handlers.onSaveNotification({
        type: notificationData.type,
        title: title || '새 알림',
        body: body || '내용을 확인해주세요',
        data: notificationData,
      });
    }

    // 배너 표시
    handlers.onShowBanner(
      title || '새 알림',
      body || '내용을 확인해주세요',
      () => handleNotificationNavigation(notificationData)
    );
  };

  // 알림 클릭 시 처리 (백그라운드/포그라운드 모두)
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const { title, body, data } = response.notification.request.content;
    const notificationData = data as unknown as PushNotificationData;
    
    console.log('알림 클릭됨:', notificationData);

    // 백그라운드에서 받은 알림도 Store에 저장 (중복 방지 로직 포함)
    if (handlers?.onSaveNotification) {
      handlers.onSaveNotification({
        type: notificationData.type,
        title: title || '새 알림',
        body: body || '내용을 확인해주세요',
        data: notificationData,
      });
    }

    handleNotificationNavigation(notificationData);
  };

  // 알림 핸들러 설정
  useEffect(() => {
    // 포그라운드에서 알림을 어떻게 표시할지 설정
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false, // 시스템 알림 비활성화 (우리 배너 사용)
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      }),
    });

    if (handlers) {
      // 포그라운드에서 알림 수신 시
      notificationListener.current = Notifications.addNotificationReceivedListener(
        handleForegroundNotification
      );

      // 알림 클릭 시 (백그라운드/포그라운드 모두)
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [handlers]);

  return {
    expoPushToken,
    registerForPushNotificationsAsync,
  };
}
