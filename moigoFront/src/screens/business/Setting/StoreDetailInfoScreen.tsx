import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { Feather } from '@expo/vector-icons';
import Toast from '@/components/common/Toast';
import { 
  useStoreInfo, 
  useUpdateStoreDetailInfo,
  useToggleStoreFacility,
  useAddStoreFacility,
  useStoreFacilities,
  useDeleteStoreFacility
} from '@/hooks/queries/useUserQueries';
import type { MenuItemDTO, FacilitiesDTO } from '@/types/DTO/users';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StoreDetailInfo'>;

interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
}

interface Facility {
  id: string;
  name: string;
  checked: boolean;
  type: string;
}

export default function StoreDetailInfoScreen() {
  const navigation = useNavigation<NavigationProp>();
  
  // API 훅 사용
  const { data: storeInfoData, isLoading: isStoreInfoLoading } = useStoreInfo();
  const { mutate: updateStoreDetailInfo, isSuccess: isSaveSuccess, isError: isSaveError, isPending: isUpdating } = useUpdateStoreDetailInfo();
  const { mutate: toggleFacilityMutation } = useToggleStoreFacility();
  const { mutate: addFacilityMutation } = useAddStoreFacility();
  
  // 편의시설 데이터를 별도로 조회
  const { data: facilitiesData, isLoading: isFacilitiesLoading } = useStoreFacilities();
  
  // 편의시설 삭제 훅
  const { mutate: deleteFacilityMutation } = useDeleteStoreFacility();
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const [formData, setFormData] = useState({
    introduction: '강남역 3분 거리에 위치한 스포츠 전문 바입니다. 대형 스크린과 프리미엄 사운드로 생생한 경기 시청이 가능하며, 다양한 맥주와 안주를 즐기실 수 있습니다. 축구, 야구, 농구 등 모든 스포츠 경기를 실시간으로 시청하실 수 있습니다.',
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: '치킨 윙',
      price: '18,000원',
      description: '바삭하게 튀긴 치킨 윙에 특제 소스를 곁들인 맥주와의 환상적인 조합',
    },
    {
      id: '2',
      name: '수제 맥주 세트',
      price: '25,000원',
      description: '국내외 프리미엄 수제 맥주 3종을 맛볼 수 있는 세트 메뉴',
    },
    {
      id: '3',
      name: '나초 플래터',
      price: '15,000원',
      description: '바삭한 나초에 치즈, 할라피뇨, 사워크림을 올린 대표 안주',
    },
  ]);

  const [facilities, setFacilities] = useState<Facility[] | null>(null);

  const [photos, setPhotos] = useState<string[]>([
    'photo1', 'photo2', 'photo3', 'photo4'
  ]);

  // API 데이터로 초기화
  useEffect(() => {
    if (storeInfoData?.data?.store_info) {
      const info = storeInfoData.data.store_info;
      
      console.log('🏪 [화면] 전체 storeInfoData:', storeInfoData);
      console.log('🏪 [화면] store_info:', info);
      console.log('🏪 [화면] facilities 필드:', info.facilities);
      
      // 매장 소개
      if (info.bio) {
        setFormData(prev => ({ ...prev, introduction: info.bio || '' }));
      }
      
      // 메뉴 정보
      if (info.menu && Array.isArray(info.menu)) {
        const apiMenuItems: MenuItem[] = info.menu.map((item: MenuItemDTO, index: number) => ({
          id: (index + 1).toString(),
          name: item.name,
          price: item.price.toLocaleString() + '원',
          description: item.description,
        }));
        setMenuItems(apiMenuItems);
      }
      
      // 편의시설은 별도 API에서 조회하므로 여기서는 설정하지 않음
      console.log('🏪 [화면] 편의시설은 별도 API에서 조회됨');
      
      // 사진
      if (info.photos && Array.isArray(info.photos)) {
        setPhotos(info.photos);
      }
    }
  }, [storeInfoData]);

  // 편의시설 데이터가 로드되면 상태 업데이트 (한 번만 실행)
  useEffect(() => {
    if (facilitiesData?.data) {
      console.log('🏪 [화면] 편의시설 API 데이터 로드됨:', facilitiesData.data);
      
      // 기본 편의시설 목록 생성
      const defaultFacilities: Facility[] = [
        { id: 'wifi', name: 'WiFi', checked: false, type: 'wifi' },
        { id: 'restroom', name: '화장실', checked: false, type: 'restroom' },
        { id: 'tv_screen', name: 'TV/스크린', checked: false, type: 'tv_screen' },
        { id: 'outlet', name: '콘센트', checked: false, type: 'outlet' },
        { id: 'parking', name: '주차장', checked: false, type: 'parking' },
        { id: 'no_smoking', name: '금연구역', checked: false, type: 'no_smoking' },
        { id: 'group_seating', name: '단체석', checked: false, type: 'group_seating' },
        { id: 'smoking_area', name: '흡연구역', checked: false, type: 'smoking_area' },
        { id: 'wireless_charging', name: '무선충전', checked: false, type: 'wireless_charging' },
      ];
      
      // API 데이터를 기반으로 상태 업데이트
      const updatedFacilities = defaultFacilities.map(facility => {
        const apiFacility = facilitiesData.data.find(
          (apiFacility: any) => apiFacility.facility_type === facility.type
        );
        
        if (apiFacility) {
          console.log(`🏪 [화면] ${facility.name} 상태:`, apiFacility.is_available === 1);
          return { ...facility, checked: apiFacility.is_available === 1 };
        }
        
        return { ...facility, checked: false };
      });
      
      setFacilities(updatedFacilities);
      console.log('✅ [화면] 편의시설 상태 업데이트 완료');
    }
  }, [facilitiesData]); // facilities 의존성 제거

  // 토스트 표시 함수들
  const showSuccessMessage = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };

  const showErrorMessage = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  // 저장 성공 시 처리
  useEffect(() => {
    if (isSaveSuccess) {
      console.log('✅ [화면] 저장 성공!');
      
      // 성공 토스트 표시
      showSuccessMessage('가게 상세 정보가 성공적으로 저장되었습니다!');
      
      // 저장된 데이터 확인을 위해 즉시 새로고침
      if (storeInfoData?.data?.store_info) {
        console.log('🔄 [화면] 저장된 편의시설 확인:', storeInfoData.data.store_info.facilities);
      }
      
      // 2초 후 이전 화면으로 이동
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    }
  }, [isSaveSuccess, navigation, storeInfoData]);

  // 저장 실패 시 처리
  useEffect(() => {
    if (isSaveError) {
      console.log('❌ [화면] 저장 실패!');
      showErrorMessage('가게 상세 정보 저장에 실패했습니다.');
    }
  }, [isSaveError]);

  // 디버깅을 위한 상태 로깅
  useEffect(() => {
    console.log('🔍 [화면] updateStoreDetailInfo 상태:', {
      isSuccess: isSaveSuccess,
      isError: isSaveError,
      isPending: isUpdating
    });
  }, [isSaveSuccess, isSaveError, isUpdating]);

  const handleIntroductionChange = (text: string) => {
    setFormData(prev => ({
      ...prev,
      introduction: text,
    }));
  };

  const toggleFacility = (id: string) => {
    if (!facilities) return;
    
    const facility = facilities.find(f => f.id === id);
    if (!facility) return;
    
    console.log('🏪 [화면] 편의시설 토글 시작:', facility);
    
    // 편의시설이 체크되어 있으면 체크 해제, 없으면 체크
    if (facility.checked) {
      // 편의시설 체크 해제 (삭제)
      console.log('❌ [화면] 편의시설 체크 해제:', facility.name);
      
      // 편의시설 삭제를 위해 facilitiesData에서 해당 편의시설 찾기
      if (facilitiesData?.data) {
        const apiFacility = facilitiesData.data.find(
          (apiFacility: any) => apiFacility.facility_type === facility.type
        );
        
        if (apiFacility) {
          console.log('🗑️ [화면] 편의시설 삭제 API 호출:', apiFacility.id);
          
          // 편의시설 삭제 API 호출
          deleteFacilityMutation(apiFacility.id, {
            onSuccess: (response) => {
              console.log('✅ [화면] 편의시설 삭제 성공:', response);
              // 로컬 상태 업데이트
              setFacilities(prev => 
                prev ? prev.map(f => 
                  f.id === id 
                    ? { ...f, checked: false }
                    : f
                ) : []
              );
            },
            onError: (error) => {
              console.error('❌ [화면] 편의시설 삭제 실패:', error);
              showErrorMessage('편의시설 삭제에 실패했습니다.');
            }
          });
        } else {
          console.log('⚠️ [화면] 삭제할 편의시설을 찾을 수 없음:', facility.type);
          // 로컬 상태만 업데이트
          setFacilities(prev => 
            prev ? prev.map(f => 
              f.id === id 
                ? { ...f, checked: false }
                : f
            ) : []
          );
        }
      } else {
        // facilitiesData가 없으면 로컬 상태만 업데이트
        setFacilities(prev => 
          prev ? prev.map(f => 
            f.id === id 
              ? { ...f, checked: false }
              : f
          ) : []
        );
      }
    } else {
      // 편의시설 체크 (추가)
      console.log('✅ [화면] 편의시설 체크:', facility.name);
      
      // 편의시설 추가 API 호출
      addFacilityMutation({
        facility_type: facility.type,
        facility_name: facility.name
      }, {
        onSuccess: (response) => {
          console.log('✅ [화면] 편의시설 추가 성공:', response);
          // 로컬 상태 업데이트
          setFacilities(prev => 
            prev ? prev.map(f => 
              f.id === id 
                ? { ...f, checked: true }
                : f
            ) : []
          );
        },
        onError: (error) => {
          console.error('❌ [화면] 편의시설 추가 실패:', error);
          showErrorMessage('편의시설 추가에 실패했습니다.');
        }
      });
    }
    
    console.log('🏪 [화면] 편의시설 상태 업데이트 완료');
  };

  const removeMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: '',
      price: '',
      description: '',
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  const updateMenuItem = (id: string, field: keyof MenuItem, value: string) => {
    setMenuItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addPhoto = () => {
    if (photos.length < 10) {
      setPhotos(prev => [...prev, `photo${Date.now()}`]);
    }
  };

  const handleSave = () => {
    // API 데이터 형식으로 변환 (편의시설 제외)
    const apiMenuItems: MenuItemDTO[] = menuItems.map(item => ({
      name: item.name,
      price: parseInt(item.price.replace(/[^0-9]/g, '')),
      description: item.description,
    }));

    const apiData = {
      menu: apiMenuItems,
      photos: photos,
      sports_categories: [],
      bio: formData.introduction,
    };

    console.log('🏪 [화면] 저장할 데이터 (편의시설 제외):', apiData);
    console.log('🏪 [화면] 편의시설은 별도 API로 관리됨');
    
    // API 호출 (편의시설 제외)
    updateStoreDetailInfo(apiData);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getCharacterCount = () => {
    return `${formData.introduction.length}/500`;
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* 매장 소개 */}
        <View className="mb-8">
          <Text className="mb-3 text-lg font-bold text-gray-800">매장 소개</Text>
          <TextInput
            className="p-4 text-gray-800 bg-gray-50 rounded-xl border border-gray-200"
            value={formData.introduction}
            onChangeText={handleIntroductionChange}
            placeholder="매장 소개를 입력하세요"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{ height: 120 }}
          />
          <Text className="mt-2 text-sm text-right text-gray-500">{getCharacterCount()}</Text>
        </View>

        {/* 주요 메뉴 */}
        <View className="mb-8">
          <View className='flex-row justify-between items-center mb-4'>
            <Text className="text-lg font-bold text-gray-800">주요 메뉴</Text>
            <TouchableOpacity 
              className="justify-center items-center self-end w-10 h-10 bg-orange-500 rounded-full"
              onPress={addMenuItem}
            >
              <Feather name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {menuItems.map((item, index) => (
            <View key={item.id} className="p-4 mb-3 bg-gray-50 rounded-xl border border-gray-200">
              <View className="flex-row justify-between items-start mb-3">
                <TextInput
                  className="flex-1 text-base font-semibold text-gray-800 bg-transparent"
                  value={item.name}
                  onChangeText={(text) => updateMenuItem(item.id, 'name', text)}
                  placeholder="메뉴명을 입력하세요"
                />
                <TouchableOpacity onPress={() => removeMenuItem(item.id)}>
                  <Feather name="x" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                className="mb-3 text-lg font-bold text-orange-500 bg-transparent"
                value={item.price.replace('원', '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChangeText={(text) => {
                  // 숫자만 입력받기
                  const numericText = text.replace(/[^0-9]/g, '');
                  updateMenuItem(item.id, 'price', numericText + '원');
                }}
                placeholder="가격을 입력하세요"
                keyboardType="numeric"
              />
              
              <TextInput
                className="text-sm text-gray-600 bg-transparent"
                value={item.description}
                onChangeText={(text) => updateMenuItem(item.id, 'description', text)}
                placeholder="메뉴 설명을 입력하세요"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          ))}
        </View>

        {/* 편의시설 */}
        <View className="mb-8">
          <Text className="mb-3 text-lg font-bold text-gray-800">편의시설</Text>
          {isStoreInfoLoading || !facilities ? (
            <View className="flex-row flex-wrap gap-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <View
                  key={index}
                  className="flex-row items-center px-3 py-2 rounded-full border border-gray-300 bg-gray-100"
                >
                  <View className="w-5 h-5 rounded-full bg-gray-300 mr-2" />
                  <Text className="text-sm font-medium text-gray-400">
                    {['WiFi', '화장실', 'TV/스크린', '콘센트', '주차장', '금연구역', '단체석', '흡연구역', '무선충전'][index]}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {facilities.map((facility) => (
                <TouchableOpacity
                  key={facility.id}
                  className={`flex-row items-center px-3 py-2 rounded-full border ${
                    facility.checked 
                      ? 'bg-orange-500 border-orange-500' 
                      : 'bg-white border-gray-300'
                  }`}
                  onPress={() => toggleFacility(facility.id)}
                >
                  <View className={`w-5 h-5 rounded-full justify-center items-center mr-2 ${
                    facility.checked ? 'bg-white' : 'bg-gray-300'
                  }`}>
                    {facility.checked && (
                      <Feather name="check" size={12} color="#f97316" />
                    )}
                  </View>
                  <Text className={`text-sm font-medium ${
                    facility.checked ? 'text-white' : 'text-gray-600'
                  }`}>
                    {facility.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 매장 사진 */}
        <View className="mb-8">
          <Text className="mb-3 text-lg font-bold text-gray-800">매장 사진</Text>
          <Text className="mb-3 text-sm text-gray-500">최대 10장</Text>
          
          {/* 사진 추가 버튼 */}
          <TouchableOpacity 
            className="justify-center items-center mb-4 w-full h-32 rounded-xl border-2 border-gray-300 border-dashed"
            onPress={addPhoto}
            disabled={photos.length >= 10}
          >
            <Feather name="camera" size={32} color="#9CA3AF" />
            <Text className="mt-2 text-gray-500">사진 추가하기</Text>
          </TouchableOpacity>

          {/* 기존 사진들 */}
          <View className="flex-row flex-wrap gap-3">
            {photos.map((photo, index) => (
              <View key={index} className="relative">
                <View className="justify-center items-center w-20 h-20 bg-gray-200 rounded-lg">
                  <Text className="text-xs text-gray-500">사진 {index + 1}</Text>
                </View>
                <TouchableOpacity 
                  className="absolute -top-2 -right-2 justify-center items-center w-6 h-6 bg-red-500 rounded-full"
                  onPress={() => removePhoto(index)}
                >
                  <Feather name="x" size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="px-4 pb-12 bg-white border-t-2 border-mainGray">
        <View className="flex-row gap-3 pt-4">
          <TouchableOpacity 
            className="flex-1 px-6 py-4 rounded-xl border border-gray-300"
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text className="font-medium text-center text-gray-600">취소</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 px-6 py-4 bg-orange-500 rounded-xl"
            onPress={handleSave}
            activeOpacity={0.7}
            disabled={isUpdating}
          >
            <Text className="font-medium text-center text-white">
              {isUpdating ? '저장 중...' : '저장'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 토스트 */}
      <Toast 
        visible={showToast}
        message={toastMessage} 
        type={toastType}
        onHide={hideToast}
        duration={2000}
      />
    </View>
  );
}