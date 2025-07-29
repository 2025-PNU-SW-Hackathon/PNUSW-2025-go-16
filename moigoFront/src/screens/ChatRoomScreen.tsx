import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types/RootStackParamList';
import { ChatRoom } from '@/types/ChatTypes';
import ChatBubble from '@/components/chat/ChatBubble';
import DropdownMenu, { DropdownOption } from '@/components/common/DropdownMenu';
import Feather from 'react-native-vector-icons/Feather';

type ChatRoomScreenRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;



export default function ChatRoomScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChatRoomScreenRouteProp>();
  const { chatRoom } = route.params;
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  // 방장용 메뉴 옵션
  const hostMenuOptions: DropdownOption[] = [
    { id: '1', label: '매칭 정보 보기', onPress: () => console.log('매칭 정보 보기') },
    { id: '2', label: '매칭 정보 수정하기', onPress: () => console.log('매칭 정보 수정하기') },
    { id: '3', label: '매칭 모집 마감하기', onPress: () => console.log('매칭 모집 마감하기') },
    { id: '4', label: '참여자 목록', onPress: () => console.log('참여자 목록') },
    { id: '5', label: '채팅방 나가기', onPress: () => navigation.goBack() },
    { id: '6', label: '신고하기', isDanger: true, onPress: () => console.log('신고하기') },
  ];

  // 일반 참여자용 메뉴 옵션
  const participantMenuOptions: DropdownOption[] = [
    { id: '1', label: '채팅방 정보', onPress: () => console.log('채팅방 정보') },
    { id: '2', label: '멤버 관리', onPress: () => console.log('멤버 관리') },
    { id: '3', label: '알림 설정', onPress: () => console.log('알림 설정') },
    { id: '4', label: '채팅방 나가기', onPress: () => navigation.goBack() },
  ];

  // 현재 사용자의 메뉴 옵션 결정
  const menuOptions = chatRoom.isHost ? hostMenuOptions : participantMenuOptions;

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: 메시지 전송 로직 구현
      console.log('메시지 전송:', message);
      setMessage('');
    }
  };



  return (
    <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
      <KeyboardAvoidingView 
        className="flex-1 bg-gray-50"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 헤더 */}
        <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {chatRoom.title}
            </Text>
            <Text className="text-sm text-gray-600">
              {chatRoom.subtitle}
            </Text>
          </View>

          {/* 메뉴 버튼 */}
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            className="p-2"
          >
            <Text className="text-xl font-bold text-gray-700">⋮</Text>
          </TouchableOpacity>
        </View>

        {/* 드롭다운 메뉴 */}
        <DropdownMenu
          options={menuOptions}
          isVisible={showMenu}
          onClose={() => setShowMenu(false)}
        />

      {/* 메시지 영역 */}
      <ScrollView className="flex-1 px-4 py-2">
        <ChatBubble
          message="안녕하세요! 오늘 함께 경기 볼 멤버분들 반갑습니다"
          isMyMessage={false}
          senderName="박태원 (방장)"
          senderAvatar="방"
        />
        
        <ChatBubble
          message="안녕하세요! 저도 반갑습니다"
          isMyMessage={true}
        />
        
        <ChatBubble
          message="네 안녕하세요~ 오늘 경기 기대되네요!"
          isMyMessage={false}
          senderName="정예준"
          senderAvatar="참"
        />
        
        <ChatBubble
          message="정말 긴 메시지를 보내면 어떻게 될까요? 이렇게 긴 텍스트가 들어가면 자동으로 줄바꿈이 되어서 다음 줄로 넘어가게 됩니다. 이제 말풍선이 더 자연스럽게 보일 거예요!"
          isMyMessage={false}
          senderName="김세한"
          senderAvatar="참"
        />
      </ScrollView>

      {/* 메시지 입력 영역 */}
      <View className="bg-white border-t border-gray-200 px-4 py-3 flex-row items-center">
        {/* 왼쪽 상점 아이콘 버튼 */}
        <TouchableOpacity
          onPress={() => console.log('상점 버튼 클릭')}
          className="w-10 h-10 rounded-full bg-mainOrange items-center justify-center mr-3"
          activeOpacity={0.8}
        >
            <Feather name="home" size={15} color="#F5F5F5" />
        </TouchableOpacity>
        
        {/* 메시지 입력 필드 (전송 버튼 포함) */}
        <View className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-3 flex-row items-center">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="메시지를 입력하세요"
            className="flex-1 px-2"
            multiline
            placeholderTextColor="#9CA3AF"
          />
          
          {/* 전송 버튼 (입력 필드 안에) */}
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!message.trim()}
            className={`w-8 h-8 rounded-full items-center justify-center ${
              message.trim() ? 'bg-mainOrange' : 'bg-gray-300'
            }`}
            activeOpacity={0.8}
          >
            <Feather name="send" size={15} color="#F5F5F5" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
} 