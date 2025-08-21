import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface StoreInfoCardProps {
  storeName: string;
  address: string;
  businessNumber: string;
  iconName: string;
  iconColor?: string;
}

export default function StoreInfoCard({ 
  storeName, 
  address, 
  businessNumber, 
  iconName, 
  iconColor = "#f97316" 
}: StoreInfoCardProps) {
  return (
    <View className="mx-4 mb-6">
      <View className="p-4 bg-white rounded-2xl border-2 border-mainGray">
        <View className="flex-row items-center mb-3">
          <View className={`justify-center items-center mr-3 w-12 h-12 rounded-full`} style={{ backgroundColor: iconColor }}>
            <Feather name={iconName as any} size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">{storeName}</Text>
            <Text className="text-sm text-gray-600">{address}</Text>
            <Text className="text-xs text-gray-500">{businessNumber}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
