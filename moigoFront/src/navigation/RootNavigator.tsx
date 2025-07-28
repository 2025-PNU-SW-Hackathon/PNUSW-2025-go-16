// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import OnboardingScreen from '@/screens/OnboardingScreen';
import LoginScreen from '@/screens/LoginScreen';
import SignupScreen from '@/screens/SignupScreen';
import type {RootStackParamList} from '@/types/RootStackParamList';
import { useAuthStore } from '@/store';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // Zustand 스토어에서 로그인 상태 가져오기
  const { isLoggedIn } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Main" options={{ headerShown: false }}>
          {() => <MainTabNavigator />}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {() => <LoginScreen />}
          </Stack.Screen>
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }}/>
        </>
      )}
    </Stack.Navigator>
  );
}
