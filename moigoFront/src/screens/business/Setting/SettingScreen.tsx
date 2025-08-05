import { Text, View, ScrollView } from "react-native";

export default function SettingScreen () {
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-8 pb-20" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-gray-800">Setting</Text> 
      </ScrollView>
    </View>
  );
};
