import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
}

export default function StarRating({ rating, onRatingChange, size = 24 }: StarRatingProps) {
  return (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRatingChange(star)} className="mr-1">
          <Feather
            name="star"
            size={size}
            color={star <= rating ? COLORS.mainOrange : COLORS.mainDarkGray}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
