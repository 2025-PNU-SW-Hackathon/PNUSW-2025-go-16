import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ModalBox from '@/components/common/ModalBox';
import StarRating from './StarRating';
import PrimaryButton from '@/components/common/PrimaryButton';
import type { ParticipatedMatch } from '@/types/reservation';
import { COLORS } from '@/constants/colors';

interface ReviewModalProps {
  visible: boolean;
  match: ParticipatedMatch | null;
  onClose: () => void;
  onSubmit: (rating: number, content: string) => void;
}

export default function ReviewModal({ visible, match, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const maxLength = 500;

  const handleSubmit = () => {
    if (rating === 0) {
      // 별점을 선택하지 않은 경우 처리
      return;
    }
    onSubmit(rating, content);
    // 폼 초기화
    setRating(0);
    setContent('');
    onClose();
  };

  const handleClose = () => {
    setRating(0);
    setContent('');
    onClose();
  };

  return (
    <ModalBox visible={visible} title="리뷰 작성" onClose={handleClose}>
      <View className="gap-8">
        {/* 경기 정보 */}
        <View className="p-4 bg-gray-100 rounded-lg">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-bold text-mainDark">{match?.title}</Text>
            <Text className="text-sm text-mainGrayText">{match?.location.split(',')[0]}</Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="calendar" size={16} color={COLORS.mainGrayText} />
            <Text className="ml-2 text-sm text-mainGrayText">
              {match?.date} {match?.time}
            </Text>
          </View>
        </View>

        {/* 별점 */}
        <View>
          <Text className="mb-2 text-base font-medium text-mainDark">별점</Text>
          <StarRating rating={rating} onRatingChange={setRating} />
        </View>

        {/* 리뷰 내용 */}
        <View>
          <Text className="mb-2 text-base font-medium text-mainDark">리뷰 내용</Text>
          <View className="relative">
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="경기 시청 경험은 어떠셨나요?"
              multiline
              numberOfLines={6}
              maxLength={maxLength}
              className="p-4 text-base rounded-lg border border-gray-300 min-h-16"
              textAlignVertical="top"
            />
            <Text className="absolute right-1 bottom-1 text-xs text-mainGrayText">
              {content.length}/{maxLength}
            </Text>
          </View>
        </View>

        {/* 버튼 */}
        <View className="flex-row gap-2 mt-6">
          <View className="flex-1">
            <PrimaryButton
              title="등록하기"
              onPress={handleSubmit}
              disabled={rating === 0 || content.length === 0}
            />
          </View>

          <View className="flex-1">
            <PrimaryButton title="취소" color={COLORS.mainGray} onPress={handleClose} />
          </View>
        </View>
      </View>
    </ModalBox>
  );
}
