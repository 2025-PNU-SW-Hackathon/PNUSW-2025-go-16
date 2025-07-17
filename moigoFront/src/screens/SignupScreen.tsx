import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';

export default function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-mainOrange">로그인 화면</Text>
      <Button title="로그인" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}