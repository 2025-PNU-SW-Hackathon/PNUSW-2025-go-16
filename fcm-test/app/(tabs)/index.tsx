import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// ====== 서버 주소 ======
// ⚠️ 실기기에서 테스트할 땐 'localhost' 대신 PC의 LAN IP(예: http://192.168.0.10:5000)로 바꾸세요.
const SERVER_BASE_URL = 'http://192.168.45.12:5000/api/v1/auth/login';

Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    // iOS: 최신 타입 — shouldShowAlert 대신 아래 두 개 사용
    shouldShowBanner: true,
    shouldShowList: true,
    // 공통
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [userId, setUserId] = useState('testuser123');
  const [userPwd, setUserPwd] = useState('password123');
  const [serverMsg, setServerMsg] = useState('');
  const [lastNotification, setLastNotification] =
    useState<Notifications.Notification | null>(null);

  const receivedSubRef = useRef<Notifications.Subscription | null>(null);
  const responseSubRef = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // 1) 권한 요청 + Expo 토큰 발급 + Android 채널
    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) setExpoPushToken(token);
    })();

    // 2) 포그라운드 수신 리스너
    receivedSubRef.current = Notifications.addNotificationReceivedListener(
      (notif) => setLastNotification(notif)
    );

    // 3) 알림 클릭 리스너
    responseSubRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response?.notification?.request?.content?.data as any;
        console.log('🔔 Notification click data:', data);
        Alert.alert('알림 클릭', JSON.stringify(data));
      });

    return () => {
      receivedSubRef.current && receivedSubRef.current.remove();
      responseSubRef.current && responseSubRef.current.remove();
    };
  }, []);

  // 로그인 + 토큰 서버 전송
  const loginAndRegisterToken = async () => {
    try {
      if (!expoPushToken) {
        Alert.alert('토큰 없음', 'Expo 토큰 발급을 먼저 기다려주세요.');
        return;
      }
      const payload = {
        user_id: userId,
        user_pwd: userPwd,
        expo_token: expoPushToken,
      };

      setServerMsg('서버에 로그인/토큰 등록 요청 중...');
      const res = await fetch(SERVER_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('❌ 서버 응답 에러:', json);
        setServerMsg(`❌ 실패: ${json?.message || res.status}`);
        Alert.alert('실패', json?.message || '로그인/토큰 등록 실패');
        return;
      }

      setServerMsg(`✅ 성공: ${json?.message || '로그인/토큰 등록 완료'}`);
      Alert.alert('성공', '로그인 및 토큰 등록 완료!');
      console.log('✅ 서버 응답:', json);
    } catch (err: any) {
      console.error('🚨 요청 실패:', err);
      setServerMsg(`❌ 에러: ${err?.message}`);
      Alert.alert('에러', err?.message || '요청 실패');
    }
  };

  // (옵션) 백엔드 없이 Expo API로 바로 푸시 보내보기
  const sendLocalExpoPush = async () => {
    if (!expoPushToken)
      return Alert.alert('토큰 없음', 'Expo 토큰 발급을 먼저 기다려주세요.');
    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: expoPushToken,
          sound: 'default',
          title: '로컬 테스트',
          body: '백엔드 없이 Expo API 직접 전송',
          data: { hello: 'world' },
        }),
      });
      const json = await res.json().catch(() => ({}));
      console.log('📤 Expo API 응답:', json);
      Alert.alert('전송됨', 'Expo API로 테스트 푸시 전송');
    } catch (e: any) {
      console.error('Expo API 전송 실패:', e);
      Alert.alert('전송 실패', e?.message || 'Expo API 호출 실패');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">FCM 테스트 (Expo)</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">1) 서버 주소</ThemedText>
        <ThemedText style={styles.code}>{SERVER_BASE_URL}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">2) Expo Push Token</ThemedText>
        <ThemedText selectable style={styles.code}>
          {expoPushToken || '(발급 중...)'}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">3) 로그인 + 토큰 전송</ThemedText>
        <View style={{ gap: 8 }}>
          <TextInput
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
            autoCapitalize="none"
            placeholder="user_id"
          />
          <TextInput
            style={styles.input}
            value={userPwd}
            onChangeText={setUserPwd}
            autoCapitalize="none"
            secureTextEntry
            placeholder="user_pwd"
          />
          <Button title="로그인 + 토큰 서버 전송" onPress={loginAndRegisterToken} />
        </View>
        <ThemedText style={styles.code}>{serverMsg}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">4) (옵션) 로컬 푸시 테스트</ThemedText>
        <Button title="Expo API로 즉시 푸시" onPress={sendLocalExpoPush} />
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">최근 수신 알림</ThemedText>
        <ScrollView horizontal>
          <ThemedText style={styles.codeMono}>
            {lastNotification
              ? JSON.stringify(lastNotification.request?.content, null, 2)
              : '(수신 없음)'}
          </ThemedText>
        </ScrollView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    if (!Constants.isDevice) {
      Alert.alert('주의', '실기기에서만 푸시 토큰을 받을 수 있습니다.');
      return null;
    }

    // 권한
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('권한 필요', '푸시 알림 권한이 필요합니다.');
      return null;
    }

    // Android 채널
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // EAS Project ID(있으면 지정)
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      (Constants as any).easConfig?.projectId;

    if (!projectId) {
      console.warn('⚠️ projectId 미설정: app.json의 extra.eas.projectId를 확인하세요.');
    }

    // 토큰 발급
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenResponse.data;
    console.log('ExpoPushToken:', token);

    if (!token) {
      console.warn('⚠️ push token이 비어있습니다. 네트워크/프로젝트 설정을 확인하세요.');
      return null;
    }
    return token;
  } catch (err: any) {
    console.error('🚨 push token 발급 실패:', err?.message || err);
    Alert.alert('오류', err?.message || 'push token 발급 실패');
    return null;
  }
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  card: {
    gap: 8,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  code: {
    fontSize: 12,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#f6f8fa',
  },
  codeMono: {
    fontSize: 12,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#f6f8fa',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) as any,
    minWidth: 260,
  },
});