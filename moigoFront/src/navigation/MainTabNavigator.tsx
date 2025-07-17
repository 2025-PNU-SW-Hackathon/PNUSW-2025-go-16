// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@/screens/HomeScreen';
import MeetingScreen from '@/screens/MeetingScreen';
import ChatScreen from '@/screens/ChatScreen';
import MyScreen from '@/screens/MyScreen';

export type MainTabParamList = {
  Home: undefined;
  Meeting: undefined;
  Chat: undefined;
  My: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Meeting" component={MeetingScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="My" component={MyScreen} />
    </Tab.Navigator>
  );
}