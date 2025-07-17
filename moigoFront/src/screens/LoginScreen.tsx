import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-mainOrange">로그인 화면</Text>
      <Button title="로그인" onPress={onLogin} />
      <Button title="회원가입" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}