import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}

export default function PasswordInput({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  error 
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-base font-medium text-mainDark">
        {label}
      </Text>
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!isVisible}
          className={`p-4 text-base border rounded-lg ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <TouchableOpacity
          onPress={() => setIsVisible(!isVisible)}
          className="absolute top-4 right-4"
        >
          <Feather
            name={isVisible ? 'eye' : 'eye-off'}
            size={20}
            color={COLORS.mainGrayText}
          />
        </TouchableOpacity>
      </View>
      {error && (
        <Text className="mt-1 text-sm text-red-500">{error}</Text>
      )}
    </View>
  );
} 