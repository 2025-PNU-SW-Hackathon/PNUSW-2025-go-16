// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '@/screens/LoginScreen';
import SignupScreen from '@/screens/SignupScreen';
import type {RootStackParamList} from '@/types/RootStackParamList';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // 예시: 실제로는 로그인 상태에 따라 분기
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

return (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {isLoggedIn ? (
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {() => <MainTabNavigator />}
      </Stack.Screen>
    ) : (
      <>
        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {() => <LoginScreen onLogin={() => setIsLoggedIn(true)} />}
        </Stack.Screen>
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }}/>
      </>
    )}
  </Stack.Navigator>
);
}
