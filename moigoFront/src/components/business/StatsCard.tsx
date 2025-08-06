import React from "react";
import { View, Text } from "react-native";

interface StatsCardProps {
  title: string;
  value: string | number;
  color: "blue" | "green" | "purple";
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, color }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return { bg: "bg-blue-50", text: "text-blue-600" };
      case "green":
        return { bg: "bg-green-50", text: "text-green-600" };
      case "purple":
        return { bg: "bg-purple-50", text: "text-purple-600" };
      default:
        return { bg: "bg-blue-50", text: "text-blue-600" };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <View className={`flex-1 ${colorClasses.bg} rounded-2xl p-3`}>
      <Text className="mb-1 text-sm text-center text-mainGrayText">{title}</Text>
      <Text className={`text-xl font-medium text-center ${colorClasses.text}`}>
        {value}
      </Text>
    </View>
  );
};

export default StatsCard; 