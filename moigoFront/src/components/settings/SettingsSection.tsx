import { View, Text } from 'react-native';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="flex-1 mb-6">
      <Text className="px-4 mb-3 text-lg font-semibold text-mainDarkGray">{title}</Text>
      {children}
    </View>
  );
}
