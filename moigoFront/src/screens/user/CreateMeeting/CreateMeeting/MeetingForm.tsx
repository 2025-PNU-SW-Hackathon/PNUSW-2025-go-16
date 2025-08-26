import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Keyboard } from 'react-native';

interface MeetingFormProps {
  meetingName: string;
  setMeetingName: (text: string) => void;
  maxPeople: number;
  setMaxPeople: (value: number) => void;
  description: string;
  setDescription: (text: string) => void;
  errors: any;
}

// 폼 컴포넌트
export default function MeetingForm({
  meetingName,
  setMeetingName,
  maxPeople,
  setMaxPeople,
  description,
  setDescription,
  errors,
}: MeetingFormProps) {
  return (
    <>
      {/* 모임 이름 */}
      <View className="px-4 mt-4">
        <View className="flex-row items-center gap-2">
          <Text className="mb-2 font-bold">모임 이름</Text>
          <Text className="text-2xl text-mainRed">*</Text>
        </View>
        <TextInput
          value={meetingName}
          onChangeText={setMeetingName}
          placeholder="예: 토트넘 vs 맨시티 같이 볼 분!"
          maxLength={50}
          className="p-3 border border-gray-200 rounded-xl"
        />
        {errors.meetingName && (
          <Text className="mt-1 text-sm text-red-500">{errors.meetingName.message}</Text>
        )}
      </View>

      {/* 최대 인원 수 */}
      <View className="px-4 mt-4">
        <View className="flex-row items-center gap-2">
          <Text className="mb-2 font-bold">최대 인원 수</Text>
          <Text className="text-2xl text-mainRed">*</Text>
        </View>

        <View className="flex-row items-center justify-between px-2 py-2 border border-gray-200 rounded-xl">
          <Text className="text-sm text-mainLightGrayText">최대 인원 수를 선택해주세요.</Text>
          <View className="flex-row items-center pr-4">
            <TouchableOpacity
              onPress={() => setMaxPeople(Math.max(1, maxPeople - 1))}
              className="items-center justify-center w-8 h-8 rounded-full bg-mainGray"
            >
              <Text className="text-xl">-</Text>
            </TouchableOpacity>
            <Text className="mx-4 text-md">{maxPeople}</Text>
            <TouchableOpacity
              onPress={() => setMaxPeople(Math.min(50, maxPeople + 1))}
              className="items-center justify-center w-8 h-8 rounded-full bg-mainGray"
            >
              <Text className="text-xl">+</Text>
            </TouchableOpacity>
          </View>
        </View>
        {errors.maxPeople && (
          <Text className="mt-1 text-sm text-mainRed">{errors.maxPeople.message}</Text>
        )}
      </View>

      {/* 모임 설명 */}
      <View className="px-4 mt-4">
        <Text className="mb-2 font-bold">모임 설명</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="모임에 대한 간단한 설명을 작성해주세요"
          maxLength={300}
          multiline
          className="p-3 rounded-xl border border-gray-200 min-h-[80px]"
          textAlignVertical="top"
          blurOnSubmit={Platform.OS === 'ios'}
          returnKeyType="done"
          onBlur={() => Platform.OS === 'android' && Keyboard.dismiss()}
        />
        {errors.description && (
          <Text className="mt-1 text-sm text-red-500">{errors.description.message}</Text>
        )}
      </View>
    </>
  );
}
