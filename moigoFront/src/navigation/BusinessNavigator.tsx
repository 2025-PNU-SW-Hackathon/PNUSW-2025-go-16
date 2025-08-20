// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@/screens/business/Home/HomeScreen';
import ChatScreen from '@/screens/ChatScreen';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';
import BusinessHeader from '@/layout/BusinessHeader';
import CalenderScreen from '@/screens/business/Calender/CalenderScreen';
import SettingScreen from '@/screens/business/Setting/SettingScreen';

export type MainTabParamList = {
  Home: undefined;
  Calender: undefined;
  Chat: undefined;
  Setting: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function BusinessNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <BusinessHeader currentScreen={route.name.toLowerCase() as any} />,
        tabBarActiveTintColor: COLORS.mainOrange,
        tabBarInactiveTintColor: COLORS.mainDarkGray,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 80,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Calender"
        component={CalenderScreen}
        options={{
          tabBarLabel: '일정',
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: '채팅',
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{
          tabBarLabel: '설정',
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
