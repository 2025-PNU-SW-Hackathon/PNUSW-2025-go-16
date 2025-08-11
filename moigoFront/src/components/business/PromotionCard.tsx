import React from "react";
import { View, Text } from "react-native";
import TagChip from "../common/TagChip";

interface PromotionCardProps {
  status: string;
  title: string;
  period: string;
  description: string;
  onEdit?: () => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({
  status,
  title,
  period,
  description,
  onEdit,
}) => {
  return (
    <View className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="mb-2">
            <TagChip 
              label={status}
              color="#fef9c3"
              textColor="#ca8a04"
            />
          </View>
          <Text className="text-sm font-medium text-gray-800">{title}</Text>
        </View>
        <Text className="text-xs text-gray-500 text-right">{period}</Text>
      </View>
      
      <Text className="text-sm text-gray-600 mb-3">{description}</Text>
      
      <View className="items-end">
        <View className="bg-orange-500 rounded-lg px-3 py-1">
          <Text className="text-xs text-white">수정하기</Text>
        </View>
      </View>
    </View>
  );
};

export default PromotionCard; 