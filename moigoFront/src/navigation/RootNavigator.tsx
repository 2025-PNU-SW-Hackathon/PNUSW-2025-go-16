// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import OnboardingScreen from '@/screens/OnboardingScreen';
import LoginScreen from '@/screens/LoginScreen';
import SignupScreen from '@/screens/SignupScreen';
import ChatRoomScreen from '@/screens/ChatRoomScreen';
import Profile from '@/screens/Mypage/Profile';
import MyInfoSetting from '@/screens/Mypage/MyInfoSetting';
import ParticipatedMatchesScreen from '@/screens/ParticipatedMatches/ParticipatedMatchesScreen';
import CustomHeader from '@/components/common/CustomHeader';
import type {RootStackParamList} from '@/types/RootStackParamList';
import { useAuthStore } from '@/store';
import CreateMeeting from '@/screens/CreateMeeting/CreateMeeting/index';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isLoggedIn } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="Main" options={{ headerShown: false }}>
            {() => <MainTabNavigator />}
          </Stack.Screen>
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ headerShown: false }} />
          <Stack.Screen 
            name="MyInfoSetting" 
            component={MyInfoSetting} 
            options={{ 
              headerShown: true,
              header: () => <CustomHeader title="설정" />,
            }} 
          />
          <Stack.Screen name="Profile" component={Profile} options={{ 
              headerShown: true,
              header: () => <CustomHeader title="프로필 관리" />,
            }}  />
          <Stack.Screen name="CreateMeeting" component={CreateMeeting} options={{ headerShown: false }} />
          <Stack.Screen 
            name="ParticipatedMatches" 
            component={ParticipatedMatchesScreen} 
            options={{ 
              headerShown: true,
              header: () => <CustomHeader title="참여한 매칭 이력" />,
            }} 
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {() => <LoginScreen />}
          </Stack.Screen>
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}
