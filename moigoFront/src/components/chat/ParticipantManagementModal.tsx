import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

interface Participant {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  isHost: boolean;
}

interface ParticipantManagementModalProps {
  isVisible: boolean;
  onClose: () => void;
  chatRoomId: number;
  isCurrentUserHost: boolean;
}

export default function ParticipantManagementModal({ 
  isVisible, 
  onClose, 
  chatRoomId, 
  isCurrentUserHost 
}: ParticipantManagementModalProps) {
  const [participants, setParticipants] = useState<Participant[]>([
    // 임시 데이터 - 실제로는 API에서 가져와야 함
    {
      id: 'user123',
      name: '김철수',
      email: 'kim@example.com',
      joinedAt: '2024-01-15T10:30:00Z',
      isHost: true
    },
    {
      id: 'user456',
      name: '이영희',
      email: 'lee@example.com',
      joinedAt: '2024-01-15T11:00:00Z',
      isHost: false
    },
    {
      id: 'user789',
      name: '박민수',
      email: 'park@example.com',
      joinedAt: '2024-01-15T11:30:00Z',
      isHost: false
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleKickParticipant = (participant: Participant) => {
    if (!isCurrentUserHost) {
      Alert.alert('권한 없음', '방장만 참여자를 강퇴할 수 있습니다.');
      return;
    }

    if (participant.isHost) {
      Alert.alert('불가능', '방장은 강퇴할 수 없습니다.');
      return;
    }

    Alert.alert(
      '참여자 강퇴',
      `${participant.name}님을 강퇴하시겠습니까?\n강퇴된 사용자는 다시 참여할 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '강퇴하기', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // TODO: 실제 강퇴 API 호출
              // await kickUserFromChatRoom(chatRoomId, participant.id);
              
              console.log('👑 [방장 권한] 참여자 강퇴:', {
                chatRoomId,
                participantId: participant.id,
                participantName: participant.name
              });

              // 참여자 목록에서 제거
              setParticipants(prev => prev.filter(p => p.id !== participant.id));
              
              Alert.alert('완료', `${participant.name}님이 강퇴되었습니다.`);
            } catch (error: any) {
              console.error('❌ 강퇴 실패:', error);
              
              if (error?.response?.status === 403) {
                Alert.alert('권한 없음', '방장만 이 기능을 사용할 수 있습니다.');
              } else {
                Alert.alert('오류', '강퇴에 실패했습니다. 다시 시도해주세요.');
              }
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleBanParticipant = (participant: Participant) => {
    if (!isCurrentUserHost) {
      Alert.alert('권한 없음', '방장만 참여자를 차단할 수 있습니다.');
      return;
    }

    if (participant.isHost) {
      Alert.alert('불가능', '방장은 차단할 수 없습니다.');
      return;
    }

    Alert.alert(
      '참여자 차단',
      `${participant.name}님을 차단하시겠습니까?\n차단된 사용자는 향후 모든 모임에 참여할 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '차단하기', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // TODO: 실제 차단 API 호출
              // await banUserFromSystem(participant.id);
              
              console.log('👑 [방장 권한] 참여자 차단:', {
                chatRoomId,
                participantId: participant.id,
                participantName: participant.name
              });

              // 참여자 목록에서 제거
              setParticipants(prev => prev.filter(p => p.id !== participant.id));
              
              Alert.alert('완료', `${participant.name}님이 차단되었습니다.`);
            } catch (error: any) {
              console.error('❌ 차단 실패:', error);
              
              if (error?.response?.status === 403) {
                Alert.alert('권한 없음', '방장만 이 기능을 사용할 수 있습니다.');
              } else {
                Alert.alert('오류', '차단에 실패했습니다. 다시 시도해주세요.');
              }
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatJoinTime = (joinedAt: string) => {
    const date = new Date(joinedAt);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderParticipant = ({ item }: { item: Participant }) => (
    <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-100">
      {/* 참여자 정보 */}
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-base font-semibold text-gray-900 mr-2">
            {item.name}
          </Text>
          {item.isHost && (
            <View className="px-2 py-0.5 bg-yellow-100 rounded-full border border-yellow-200">
              <Text className="text-xs font-bold text-yellow-700">👑 방장</Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-gray-600 mb-1">{item.email}</Text>
        <Text className="text-xs text-gray-500">
          참여시간: {formatJoinTime(item.joinedAt)}
        </Text>
      </View>

      {/* 관리 버튼들 */}
      {isCurrentUserHost && !item.isHost && (
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => handleKickParticipant(item)}
            className="px-3 py-2 bg-orange-100 rounded-lg border border-orange-200"
            disabled={loading}
          >
            <Text className="text-sm font-semibold text-orange-700">강퇴</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleBanParticipant(item)}
            className="px-3 py-2 bg-red-100 rounded-lg border border-red-200"
            disabled={loading}
          >
            <Text className="text-sm font-semibold text-red-700">차단</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* 헤더 */}
        <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900">참여자 관리</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Feather name="x" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* 참여자 수 정보 */}
        <View className="p-4 bg-white border-b border-gray-100">
          <Text className="text-sm text-gray-600">
            총 {participants.length}명 참여 중
            {isCurrentUserHost && " • 방장은 참여자를 강퇴하거나 차단할 수 있습니다"}
          </Text>
        </View>

        {/* 참여자 목록 */}
        <FlatList
          data={participants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.id}
          className="flex-1"
          showsVerticalScrollIndicator={false}
        />

        {/* 로딩 오버레이 */}
        {loading && (
          <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
            <View className="bg-white p-6 rounded-lg">
              <ActivityIndicator size="large" color="#F97316" />
              <Text className="mt-2 text-center text-gray-700">처리 중...</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
