// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@/screens/Home/HomeScreen';
import MeetingScreen from '@/screens/Meeting/MeetingScreen';
import ChatScreen from '@/screens/ChatScreen';
import MyScreen from '@/screens/MyScreen';
import Header from '@/layout/Header';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';

export type MainTabParamList = {
  Home: undefined;
  Meeting: undefined;
  Chat: undefined;
  My: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        header: () => <Header />,
        tabBarActiveTintColor: COLORS.mainOrange,
        tabBarInactiveTintColor: COLORS.mainDarkGray,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 70,
        },
      }}
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
        name="Meeting"
        component={MeetingScreen}
        options={{
          tabBarLabel: '모임',
          tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
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
        name="My"
        component={MyScreen}
        options={{
          tabBarLabel: '마이',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
