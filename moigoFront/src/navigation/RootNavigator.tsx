// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import OnboardingScreen from '@/screens/OnboardingScreen';
import LoginScreen from '@/screens/LoginScreen';
import SignupScreen from '@/screens/SignupScreen';
import ChatListScreen from '@/screens/ChatListScreen';
import ChatRoomScreen from '@/screens/ChatRoomScreen';
import MyInfoSetting from '@/screens/user/Mypage/MyInfoSetting';
import Profile from '@/screens/user/Mypage/Profile';
import ParticipatedMatchesScreen from '@/screens/user/ParticipatedMatches/ParticipatedMatchesScreen';
import ChangePasswordScreen from '@/screens/user/Password/ChangePasswordScreen';
import CustomHeader from '@/components/common/CustomHeader';
import type {RootStackParamList} from '@/types/RootStackParamList';
import { useAuthStore } from '@/store';
import CreateMeeting from '@/screens/user/CreateMeeting/CreateMeeting/index';
import BusinessNavigator from './BusinessNavigator';
import BusinessHomeScreen from '@/screens/business/Home/HomeScreen';
import StoreBasicInfoScreen from '@/screens/business/Setting/StoreBasicInfoScreen';
import StoreDetailInfoScreen from '@/screens/business/Setting/StoreDetailInfoScreen';
import SportsRegistrationScreen from '@/screens/business/Setting/SportsRegistrationScreen';
import BusinessHoursScreen from '@/screens/business/Setting/BusinessHoursScreen';
import ReservationTimeScreen from '@/screens/business/Setting/ReservationTimeScreen';
import BusinessInfoEditScreen from '@/screens/business/Setting/BusinessInfoEditScreen';
import ChatScreen from '@/screens/ChatScreen';
import StoreListScreen from '@/screens/stores/StoreListScreen';
import StoreDetailScreen from '@/screens/stores/StoreDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isLoggedIn, user } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          {/* 사용자 타입에 따라 다른 메인 화면 표시 */}
          <Stack.Screen name="Main" options={{ headerShown: false }}>
            {() => user?.userType === 'business' ? <BusinessNavigator /> : <MainTabNavigator />}
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
          <Stack.Screen 
            name="Profile" 
            component={Profile} 
            options={{ 
              headerShown: true,
              header: () => <CustomHeader title="프로필 편집" />,
            }} 
          />
          <Stack.Screen name="CreateMeeting" component={CreateMeeting} options={{ headerShown: false }} />
          <Stack.Screen 
            name="ParticipatedMatches" 
            component={ParticipatedMatchesScreen} 
            options={{ 
              headerShown: true,
              header: () => <CustomHeader title="참여한 매칭 이력" />,
            }} 
          />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="StoreList" component={StoreListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="StoreDetail" component={StoreDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen 
            name="StoreBasicInfo" 
            component={StoreBasicInfoScreen} 
            options={{ 
              headerShown: true,
              header: () => <CustomHeader title="가게 기본 정보" />,
            }} 
          />
          <Stack.Screen 
            name="StoreDetailInfo" 
            component={StoreDetailInfoScreen} 
            options={{ 
              headerShown: true,
              header: () => <CustomHeader title="가게 상세 정보" />,
            }} 
          />
          <Stack.Screen 
            name="SportsRegistration" 
            component={SportsRegistrationScreen} 
            options={{ 
              headerShown: true,
              header: () => <CustomHeader title="시청 가능 스포츠 등록" />,
            }} 
          />
          <Stack.Screen 
            name="BusinessHours" 
            component={BusinessHoursScreen} 
            options={{ 
              headerShown: true,
              header: () => <CustomHeader title="영업 시간 설정" />,
            }} 
          />
          <Stack.Screen 
            name="ReservationTime" 
            component={ReservationTimeScreen} 
            options={{ 
              headerShown: true,
              header: () => <CustomHeader title="예약 시간 설정" />,
            }} 
          />
         <Stack.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ 
              headerShown: true,
              header: () => <CustomHeader title="채팅" />,
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
      
      {/* 로그인 상태와 관계없이 접근 가능한 화면들 */}
      <Stack.Screen 
        name="BusinessInfoEdit" 
        component={BusinessInfoEditScreen} 
        options={{ 
          headerShown: true,
          header: () => <CustomHeader title="사업자 정보 등록" />,
        }} 
      />
    </Stack.Navigator>
  );
}
