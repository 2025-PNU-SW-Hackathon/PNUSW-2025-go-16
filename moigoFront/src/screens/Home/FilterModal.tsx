import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filterOptions: string[];
  filterLocations: string[];
  selectedFilter: string;
  selectedLocations: string[];
  setSelectedFilter: (filter: string) => void;
  toggleLocation: (location: string) => void;
  resetFilters: () => void;
}

function FilterModal({ 
  visible, 
  onClose, 
  filterOptions, 
  filterLocations, 
  selectedFilter, 
  selectedLocations, 
  setSelectedFilter, 
  toggleLocation, 
  resetFilters 
}: FilterModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        className="items-end justify-end flex-1 bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          className="w-full p-6 pb-16 bg-white rounded-t-3xl"
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="items-center justify-center text-xl font-bold">필터 설정</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <View className="">
            <View className="mb-4">
              <Text className="mb-2 text-lg font-bold">카테고리</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
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
            <View className="mb-8">
              <Text className="mb-2 text-lg font-bold">위치</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {['전체', ...filterLocations].map((location) => (
                    <TouchableOpacity
                      key={location}
                      className={`px-4 py-2 rounded-full ${
                        location === '전체'
                          ? selectedLocations.length === 0
                            ? 'bg-mainOrange'
                            : 'bg-gray-200'
                          : selectedLocations.includes(location)
                            ? 'bg-mainOrange'
                            : 'bg-gray-200'
                      }`}
                      onPress={() => toggleLocation(location)}
                    >
                      <Text
                        className={`font-medium ${
                          location === '전체'
                            ? selectedLocations.length === 0
                              ? 'text-white'
                              : 'text-gray-700'
                            : selectedLocations.includes(location)
                              ? 'text-white'
                              : 'text-gray-700'
                        }`}
                      >
                        {location}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View className="flex-row items-center justify-between gap-2">
              <TouchableOpacity
                className="flex-1 px-4 py-3 bg-gray-200 rounded-lg"
                onPress={resetFilters}
              >
                <Text className="font-medium text-center text-gray-700">초기화</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity className="flex-1 px-4 py-3 rounded-lg bg-mainOrange">
              <Text className="font-medium text-center text-white">적용하기</Text>
            </TouchableOpacity> */}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
export default FilterModal;
