import { View, Text, TouchableOpacity, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import TagChip from '@/components/common/TagChip';
import { COLORS } from '@/constants/colors';

interface ProfileCardProps {
  name: string;
  profileImage?: string;
  preferredSports: string[];
  onEdit: () => void;
}

export default function ProfileCard({
  name,
  profileImage,
  preferredSports,
  onEdit,
}: ProfileCardProps) {
  return (
    <View className="px-4 py-8 mx-4 mb-4 bg-white border-2 border-mainGray rounded-2xl">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {/* 프로필 이미지 */}
          <View className="w-16 h-16 mr-4 overflow-hidden bg-gray-200 rounded-full">
            {profileImage ? (
              <Image source={{ uri: profileImage }} className="w-full h-full" />
            ) : (
              <View className="items-center justify-center w-full h-full">
                <Feather name="user" size={32} color={COLORS.mainDarkGray} />
              </View>
            )}
          </View>

          {/* 사용자 정보 */}
          <View className="flex-1">
            <Text className="mb-2 text-lg font-semibold text-mainDark">{name}</Text>

            <Text className="mb-2 text-sm text-mainLightGrayText">관심 종목</Text>
            {/* 선호 스포츠 태그들 */}
            <View className="flex-row flex-wrap">
              {preferredSports.map((sport, index) => (
                <TagChip
                  key={sport}
                  label={sport}
                  color={`${COLORS.mainOrange}20`}
                  textColor={COLORS.mainOrange}
                  classNameView="mr-2 mb-1"
                  classNameText="text-xs"
                />
              ))}
            </View>
          </View>
        </View>

        {/* 편집 버튼 */}
        <TouchableOpacity
          onPress={onEdit}
          className="items-center justify-center w-12 h-12 ml-2 rounded-full bg-mainGray"
        >
          <Feather name="edit-3" size={20} color={COLORS.mainDarkGray} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
