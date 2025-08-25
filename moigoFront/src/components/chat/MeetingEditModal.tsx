import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

interface MeetingInfo {
  title: string;
  description: string;
  maxParticipants: number;
  location: string;
  startTime: string;
  endTime: string;
}

interface MeetingEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  chatRoomId: number;
  isCurrentUserHost: boolean;
  currentMeetingInfo?: Partial<MeetingInfo>;
}

export default function MeetingEditModal({ 
  isVisible, 
  onClose, 
  chatRoomId, 
  isCurrentUserHost,
  currentMeetingInfo 
}: MeetingEditModalProps) {
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>({
    title: currentMeetingInfo?.title || '축구 모임',
    description: currentMeetingInfo?.description || '함께 축구 경기를 보며 즐거운 시간을 보내요!',
    maxParticipants: currentMeetingInfo?.maxParticipants || 8,
    location: currentMeetingInfo?.location || '강남역 스포츠 펍',
    startTime: currentMeetingInfo?.startTime || '19:00',
    endTime: currentMeetingInfo?.endTime || '22:00'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<MeetingInfo>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<MeetingInfo> = {};

    if (!meetingInfo.title.trim()) {
      newErrors.title = '모임 제목을 입력해주세요';
    }

    if (!meetingInfo.description.trim()) {
      newErrors.description = '모임 설명을 입력해주세요';
    }

    if (meetingInfo.maxParticipants < 2) {
      newErrors.maxParticipants = 2;
    } else if (meetingInfo.maxParticipants > 20) {
      newErrors.maxParticipants = 20;
    }

    if (!meetingInfo.location.trim()) {
      newErrors.location = '모임 장소를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!isCurrentUserHost) {
      Alert.alert('권한 없음', '방장만 모임 정보를 수정할 수 있습니다.');
      return;
    }

    if (!validateForm()) {
      Alert.alert('입력 오류', '모든 필드를 올바르게 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // TODO: 실제 모임 정보 수정 API 호출
      // await updateMeetingInfo(chatRoomId, meetingInfo);
      
      console.log('👑 [방장 권한] 모임 정보 수정:', {
        chatRoomId,
        oldInfo: currentMeetingInfo,
        newInfo: meetingInfo
      });

      Alert.alert(
        '수정 완료',
        '모임 정보가 성공적으로 수정되었습니다.',
        [
          {
            text: '확인',
            onPress: onClose
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ 모임 정보 수정 실패:', error);
      
      if (error?.response?.status === 403) {
        Alert.alert('권한 없음', '방장만 이 기능을 사용할 수 있습니다.');
      } else {
        Alert.alert('오류', '모임 정보 수정에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateMeetingInfo = (field: keyof MeetingInfo, value: string | number) => {
    setMeetingInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 상태 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* 헤더 */}
        <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900">모임 정보 수정</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Feather name="x" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* 권한 안내 */}
          {!isCurrentUserHost && (
            <View className="p-4 mb-4 bg-red-50 rounded-lg border border-red-200">
              <Text className="text-sm font-semibold text-red-700">
                ⚠️ 방장만 모임 정보를 수정할 수 있습니다
              </Text>
            </View>
          )}

          {/* 모임 제목 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">모임 제목</Text>
            <TextInput
              value={meetingInfo.title}
              onChangeText={(text) => updateMeetingInfo('title', text)}
              placeholder="모임 제목을 입력하세요"
              className={`p-3 bg-white rounded-lg border ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
              editable={isCurrentUserHost}
            />
            {errors.title && (
              <Text className="text-sm text-red-600 mt-1">{errors.title}</Text>
            )}
          </View>

          {/* 모임 설명 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">모임 설명</Text>
            <TextInput
              value={meetingInfo.description}
              onChangeText={(text) => updateMeetingInfo('description', text)}
              placeholder="모임에 대한 설명을 입력하세요"
              multiline
              numberOfLines={3}
              className={`p-3 bg-white rounded-lg border ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
              editable={isCurrentUserHost}
              textAlignVertical="top"
            />
            {errors.description && (
              <Text className="text-sm text-red-600 mt-1">{errors.description}</Text>
            )}
          </View>

          {/* 최대 참여자 수 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">최대 참여자 수</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => updateMeetingInfo('maxParticipants', Math.max(2, meetingInfo.maxParticipants - 1))}
                className="w-10 h-10 bg-gray-200 rounded-lg items-center justify-center"
                disabled={!isCurrentUserHost || meetingInfo.maxParticipants <= 2}
              >
                <Feather name="minus" size={20} color="#374151" />
              </TouchableOpacity>
              
              <View className="flex-1 mx-3">
                <TextInput
                  value={meetingInfo.maxParticipants.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 2;
                    updateMeetingInfo('maxParticipants', Math.min(20, Math.max(2, num)));
                  }}
                  keyboardType="numeric"
                  className="p-3 bg-white rounded-lg border border-gray-300 text-center"
                  editable={isCurrentUserHost}
                />
              </View>
              
              <TouchableOpacity
                onPress={() => updateMeetingInfo('maxParticipants', Math.min(20, meetingInfo.maxParticipants + 1))}
                className="w-10 h-10 bg-gray-200 rounded-lg items-center justify-center"
                disabled={!isCurrentUserHost || meetingInfo.maxParticipants >= 20}
              >
                <Feather name="plus" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-gray-500 mt-1">2명 ~ 20명까지 설정 가능합니다</Text>
          </View>

          {/* 모임 장소 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">모임 장소</Text>
            <TextInput
              value={meetingInfo.location}
              onChangeText={(text) => updateMeetingInfo('location', text)}
              placeholder="모임 장소를 입력하세요"
              className={`p-3 bg-white rounded-lg border ${errors.location ? 'border-red-300' : 'border-gray-300'}`}
              editable={isCurrentUserHost}
            />
            {errors.location && (
              <Text className="text-sm text-red-600 mt-1">{errors.location}</Text>
            )}
          </View>

          {/* 시간 설정 */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">모임 시간</Text>
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1">시작 시간</Text>
                <TextInput
                  value={meetingInfo.startTime}
                  onChangeText={(text) => updateMeetingInfo('startTime', text)}
                  placeholder="19:00"
                  className="p-3 bg-white rounded-lg border border-gray-300"
                  editable={isCurrentUserHost}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1">종료 시간</Text>
                <TextInput
                  value={meetingInfo.endTime}
                  onChangeText={(text) => updateMeetingInfo('endTime', text)}
                  placeholder="22:00"
                  className="p-3 bg-white rounded-lg border border-gray-300"
                  editable={isCurrentUserHost}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        {isCurrentUserHost && (
          <View className="p-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              className={`py-4 rounded-lg items-center ${
                loading ? 'bg-gray-400' : 'bg-orange-500'
              }`}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="ml-2 text-white font-semibold">저장 중...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-lg">수정 완료</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}



