import React from 'react';
import { View, Text } from 'react-native';

interface ChatStatusMessageProps {
  message: string;
}

const ChatStatusMessage: React.FC<ChatStatusMessageProps> = ({ message }) => {
    return (
    <View className="mx-4 my-2 px-4 py-3 rounded-3xl bg-gray-50">
      <Text className="text-center text-sm font-medium text-gray-400">
        {message}
      </Text>
  </View>
  );
};

export default ChatStatusMessage; 