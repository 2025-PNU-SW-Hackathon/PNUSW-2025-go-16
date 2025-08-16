import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';

interface GradeCardProps {
  grade: string;
  name: string;
  progressToNextGrade: number;
  coupons: number;
  onViewBenefits: () => void;
}

export default function GradeCard({
  grade,
  name,
  progressToNextGrade,
  coupons,
  onViewBenefits,
}: GradeCardProps) {
  return (
    <View className="mx-4 mb-4 overflow-hidden rounded-2xl">
      <View 
        className="p-6"
        style={{ backgroundColor: COLORS.mainOrange }}
      >
        <View className="flex-row items-center justify-between pb-4">
          {/* 상단: 등급 라벨과 크라운 아이콘 */}
          <View className="flex-col">
            <View className="flex-row items-center mb-4">
              <View className="px-3 py-1 mr-2 rounded-3xl bg-white/70">
                <Text className="text-sm font-bold text-mainOrange">{grade} 등급</Text>
              </View>
              <Feather name="award" size={20} color="white" />
            </View>
            <View>
              {/* 사용자 이름 */}
              <Text className="mb-2 text-2xl font-bold text-white">{name}님</Text>

              {/* 다음 등급까지 안내 */}
              <Text className="mb-4 text-sm text-white">다음 등급까지 3회 더 참여하세요!</Text>
            </View>
          </View>
          {/* 진행률 원형 */}
          <View className="items-center justify-center w-32 h-32 mb-1 border-2 border-white rounded-full">
            <Text className="text-2xl font-bold text-white">{progressToNextGrade}%</Text>
          </View>
        </View>

        {/* 하단: 버튼과 진행률 */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity className="px-4 py-2 rounded-lg bg-white/70" onPress={onViewBenefits}>
            <Text className="font-medium text-mainOrange">등급별 혜택 보기</Text>
          </TouchableOpacity>

          <View className="items-center">
            {/* 쿠폰 정보 */}
            <View className="flex-row items-center">
              <Feather name="gift" size={14} color="white" />
              <Text className="ml-1 text-lg text-white">보유 쿠폰 {coupons}장</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
