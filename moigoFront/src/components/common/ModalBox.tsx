import { Modal, View, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
import { ReactNode, useEffect } from 'react';

interface ModalBoxProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function ModalBox({ visible, title, onClose, children }: ModalBoxProps) {
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // 안드로이드 백 버튼으로 키보드 dismiss
  useEffect(() => {
    if (Platform.OS === 'android' && visible) {
      const backAction = () => {
        Keyboard.dismiss();
        return false; // 기본 동작(모달 닫기) 허용
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }
  }, [visible]);

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View className="flex-1 bg-black/50">
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => {
                dismissKeyboard();
                // 안드로이드에서 지연 후 모달 닫기
                if (Platform.OS === 'android') {
                  setTimeout(() => onClose(), 100);
                } else {
                  onClose();
                }
              }}
            />
            <View className="p-6 mx-auto w-11/12 bg-white rounded-xl shadow-lg max-h-5/6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold">{title}</Text>
                <TouchableOpacity onPress={onClose}>
                  <Text className="text-2xl font-bold">×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                {children}
              </ScrollView>
            </View>
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => {
                dismissKeyboard();
                // 안드로이드에서 지연 후 모달 닫기
                if (Platform.OS === 'android') {
                  setTimeout(() => onClose(), 100);
                } else {
                  onClose();
                }
              }}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
