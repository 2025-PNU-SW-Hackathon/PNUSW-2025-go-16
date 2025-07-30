import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface FilterBtnProps {
  filterOptions: string[];
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}

function FilterBtn({ filterOptions, selectedFilter, setSelectedFilter }: FilterBtnProps) {
  return (
    <View className="px-4 py-1 bg-white">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-4">
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`px-4 py-2 rounded-full ${
                selectedFilter === filter ? 'bg-mainOrange' : 'bg-gray-200'
              }`}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                className={`font-medium ${
                  selectedFilter === filter ? 'text-white' : 'text-gray-700'
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default FilterBtn;
