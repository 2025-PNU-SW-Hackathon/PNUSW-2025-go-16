import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';

interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function CustomHeader({ 
  title, 
  showBackButton = true, 
  onBackPress 
}: CustomHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView edges={['top']} className="bg-white">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity 
          className="p-2"
          onPress={handleBackPress}
        >
          <Text className="text-2xl font-semibold">←</Text>
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-bold text-mainDark">{title}</Text>
      </View>
    </SafeAreaView>
  );
}
