import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';

interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onFilterPress: () => void;
}

function SearchBar({ searchText, setSearchText, onFilterPress }: SearchBarProps) {
  return (
    <View className="flex-row gap-2 px-4 py-2">
      <View className="flex-1 bg-white">
        <View className="flex-row items-center px-3 py-2 bg-gray-100 rounded-lg">
          <Feather name="search" size={20} color={COLORS.mainDarkGray} />
          <TextInput
            className="flex-1 ml-2 text-xl"
            placeholder="경기명, 장소 검색"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>
      <TouchableOpacity
        className="flex-row items-center gap-2 px-4 bg-gray-200 rounded-full"
        onPress={onFilterPress}
      >
        <Feather name="filter" size={15} color={COLORS.mainDarkGray} />
        <Text className="text-sm">필터</Text>
      </TouchableOpacity>
    </View>
  );
}

export default SearchBar;
