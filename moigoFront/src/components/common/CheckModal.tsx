import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';

interface CheckModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function CheckModal({ visible, title, onClose, children }: CheckModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent={true}>
      <View className="flex-1 bg-black/50">
        <View className="flex-1" />
        <View className="w-11/12 p-8 mx-auto bg-white shadow-lg rounded-3xl">{children}</View>
        <View className="flex-1" />
      </View>
    </Modal>
  );
}
