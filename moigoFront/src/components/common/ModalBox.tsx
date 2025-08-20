import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';

interface ModalBoxProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function ModalBox({ visible, title, onClose, children }: ModalBoxProps) {
  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/50">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="p-6 mx-auto w-11/12 bg-white rounded-xl shadow-lg">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl font-bold">×</Text>
            </TouchableOpacity>
          </View>
          {children}
        </View>
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}
