import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { getChatParticipants, kickParticipant } from '@/apis/chat';
import type { ParticipantDTO, ChatRoomInfoDTO } from '@/types/DTO/chat';
import MeetingStatusBadge from './MeetingStatusBadge';

// ParticipantDTO를 사용하므로 기존 인터페이스 제거

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
  const [participants, setParticipants] = useState<ParticipantDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState<ChatRoomInfoDTO | null>(null);

  // 🆕 참여자 목록 로드
  const loadParticipants = async () => {
    try {
      console.log('👥 참여자 목록 로딩 시작:', chatRoomId);
      setInitialLoading(true);
      
      const response = await getChatParticipants(chatRoomId);
      
      if (response.success) {
        console.log('✅ 참여자 목록 로딩 성공:', response.data);
        setParticipants(response.data.participants);
        // 🆕 서버에서 제공하는 room_info 저장
        if (response.data.room_info) {
          setRoomInfo(response.data.room_info);
          console.log('📊 채팅방 정보 업데이트:', response.data.room_info);
        }
      } else {
        console.error('❌ 참여자 목록 로딩 실패:', response.message);
        Alert.alert('오류', '참여자 목록을 불러올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('❌ 참여자 목록 API 에러:', error);
      Alert.alert('오류', '참여자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setInitialLoading(false);
    }
  };

  // 🆕 모달이 열릴 때마다 참여자 목록 로드
  useEffect(() => {
    if (isVisible) {
      loadParticipants();
    }
  }, [isVisible, chatRoomId]);

  const handleKickParticipant = (participant: ParticipantDTO) => {
    if (!isCurrentUserHost) {
      Alert.alert('권한 없음', '방장만 참여자를 강퇴할 수 있습니다.');
      return;
    }

    if (participant.is_host) {
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
              console.log('👑 [방장 권한] 참여자 강퇴 시작:', {
                chatRoomId,
                participantId: participant.user_id,
                participantName: participant.name
              });

              // 🆕 실제 강퇴 API 호출
              const response = await kickParticipant(chatRoomId, participant.user_id, "부적절한 행동");
              
              if (response.success) {
                console.log('✅ 강퇴 성공:', response.data);
                
                // 참여자 목록에서 제거
                setParticipants(prev => prev.filter(p => p.user_id !== participant.user_id));
                
                Alert.alert('완료', `${participant.name}님이 강퇴되었습니다.`);
              } else {
                Alert.alert('오류', response.message || '강퇴에 실패했습니다.');
              }
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

  const handleBanParticipant = (participant: ParticipantDTO) => {
    if (!isCurrentUserHost) {
      Alert.alert('권한 없음', '방장만 참여자를 차단할 수 있습니다.');
      return;
    }

    if (participant.is_host) {
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
              // TODO: 실제 차단 API 호출 (추후 구현)
              // await banUserFromSystem(participant.user_id);
              
              console.log('👑 [방장 권한] 참여자 차단 (미구현):', {
                chatRoomId,
                participantId: participant.user_id,
                participantName: participant.name
              });

              Alert.alert('알림', '차단 기능은 추후 구현 예정입니다.');
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

  const renderParticipant = ({ item }: { item: ParticipantDTO }) => (
    <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-100">
      {/* 참여자 정보 */}
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-base font-semibold text-gray-900 mr-2">
            {item.name || '알 수 없는 사용자'}
          </Text>
          {item.is_host ? (
            <View className="px-2 py-0.5 bg-yellow-100 rounded-full border border-yellow-200">
              <Text className="text-xs font-bold text-yellow-700">👑 방장</Text>
            </View>
          ) : null}
          {item.is_online ? (
            <View className="ml-2 px-2 py-0.5 bg-green-100 rounded-full border border-green-200">
              <Text className="text-xs font-bold text-green-700">🟢 온라인</Text>
            </View>
          ) : null}
        </View>
        {item.email ? (
          <Text className="text-sm text-gray-600 mb-1">{item.email}</Text>
        ) : null}
        <Text className="text-xs text-gray-500">
          참여시간: {formatJoinTime(item.joined_at)}
        </Text>
        {item.role ? (
          <Text className="text-xs text-gray-500">
            역할: {item.role}
          </Text>
        ) : null}
      </View>

      {/* 관리 버튼들 */}
      {isCurrentUserHost && !item.is_host ? (
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
      ) : null}
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

        {/* 🆕 모임 정보 및 참여자 수 */}
        <View className="p-4 bg-white border-b border-gray-100">
          {/* 모임 기본 정보 */}
          {roomInfo && (
            <View className="mb-3">
              {/* 경기 제목 */}
              {roomInfo.match_title && (
                <Text className="text-base font-semibold text-gray-900 mb-2">
                  ⚽ {roomInfo.match_title}
                </Text>
              )}
              
              {/* 모집 상태 및 참여자 정보 */}
              <View className="flex-row items-center mb-2">
                <MeetingStatusBadge status={roomInfo.reservation_status} size="small" />
                <Text className="text-sm text-gray-600 ml-3">
                  👥 {roomInfo.participant_info} ({roomInfo.participant_count}/{roomInfo.max_participant_count})
                </Text>
              </View>
              
              {/* 시작 시간 */}
              {roomInfo.reservation_start_time && (
                <Text className="text-sm text-gray-500">
                  🕐 {new Date(roomInfo.reservation_start_time).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              )}
            </View>
          )}
          
          {/* 참여자 수 정보 */}
          <Text className="text-sm text-gray-600">
            총 {participants.length}명 참여 중
            {isCurrentUserHost ? " • 방장은 참여자를 강퇴하거나 차단할 수 있습니다" : ""}
          </Text>
        </View>

        {/* 참여자 목록 */}
        {initialLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="mt-2 text-gray-600">참여자 목록을 불러오는 중...</Text>
          </View>
        ) : (
          <FlatList
            data={participants}
            renderItem={renderParticipant}
            keyExtractor={(item) => item.user_id}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center p-8">
                <Text className="text-gray-500">참여자가 없습니다.</Text>
              </View>
            }
          />
        )}

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
