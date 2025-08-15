import React from 'react';
import { View, Text } from 'react-native';

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function SettingSection({ title, children, className = '' }: SettingSectionProps) {
  return (
    <View className={`mx-4 mb-6 ${className}`}>
      <Text className="mb-3 text-lg font-bold text-gray-800">{title}</Text>
      {children}
    </View>
  );
}
