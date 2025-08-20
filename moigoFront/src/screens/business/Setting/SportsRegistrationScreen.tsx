import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { Feather } from '@expo/vector-icons';
import Toast from '@/components/common/Toast';
import DeleteSportModal from '@/components/business/DeleteSportModal';
import EditSportModal from '@/components/business/EditSportModal';
import PlusSportModal from '@/components/business/PlusSportModal';
import { useSportsCategories, useDeleteSportsCategory, useAddSportsCategory } from '@/hooks/queries/useUserQueries';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SportsRegistration'>;

interface Sport {
  id: string;
  name: string;
  platforms: string[];
  availableSeats: number;
}

export default function SportsRegistrationScreen() {
  const navigation = useNavigation<NavigationProp>();
  
  // API 훅 사용
  const { data: sportsCategoriesData, isLoading: isSportsCategoriesLoading } = useSportsCategories();
  const { mutate: deleteSportsCategory, isSuccess: isDeleteSuccess, isError: isDeleteError } = useDeleteSportsCategory();
  const { mutate: addSportsCategory, isSuccess: isAddSuccess, isError: isAddError } = useAddSportsCategory();
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlusModal, setShowPlusModal] = useState(false);
  const [sportToDelete, setSportToDelete] = useState<Sport | null>(null);
  const [sportToEdit, setSportToEdit] = useState<Sport | null>(null);
  
  const [sports, setSports] = useState<Sport[]>([
    {
      id: '1',
      name: '축구',
      platforms: ['SBS Sports', 'MBC Sports'],
      availableSeats: 12,
    },
    {
      id: '2',
      name: '농구',
      platforms: ['KBS Sports', 'SPOTV'],
      availableSeats: 8,
    },
    {
      id: '3',
      name: '야구',
      platforms: ['KBS N Sports', 'MBC Sports+'],
      availableSeats: 15,
    },
    {
      id: '4',
      name: '격투기',
      platforms: ['SPOTV', 'ESPN'],
      availableSeats: 8,
    },
    {
      id: '5',
      name: '게임',
      platforms: ['Twitch', 'AfreecaTV'],
      availableSeats: 10,
    },
  ]);

  // API 데이터로 초기화
  useEffect(() => {
    if (sportsCategoriesData?.success && sportsCategoriesData?.data) {
      const apiSportsCategories = sportsCategoriesData.data;
      
      // API에서 받은 스포츠 카테고리를 기존 UI 형식에 맞게 변환
      const convertedSports: Sport[] = apiSportsCategories.map((category: any, index: number) => ({
        id: (index + 1).toString(),
        name: category.name,
        platforms: getDefaultPlatforms(category.name), // 기본 플랫폼 설정
        availableSeats: getDefaultSeats(category.name), // 기본 좌석 수 설정
      }));
      
      setSports(convertedSports);
    }
  }, [sportsCategoriesData]);

  // 스포츠별 기본 플랫폼 설정
  const getDefaultPlatforms = (sportName: string): string[] => {
    switch (sportName) {
      case '축구':
        return ['SBS Sports', 'MBC Sports'];
      case '농구':
        return ['KBS Sports', 'SPOTV'];
      case '야구':
        return ['KBS N Sports', 'MBC Sports+'];
      case '격투기':
        return ['SPOTV', 'ESPN'];
      case '게임':
        return ['Twitch', 'AfreecaTV'];
      default:
        return ['SBS Sports'];
    }
  };

  // 스포츠별 기본 좌석 수 설정
  const getDefaultSeats = (sportName: string): number => {
    switch (sportName) {
      case '축구':
        return 12;
      case '농구':
        return 8;
      case '야구':
        return 15;
      case '격투기':
        return 8;
      case '게임':
        return 10;
      default:
        return 10;
    }
  };

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

  // 삭제 성공 시 처리
  useEffect(() => {
    if (isDeleteSuccess) {
      console.log('✅ [화면] 스포츠 카테고리 삭제 성공!');
      showSuccessMessage('스포츠 카테고리가 삭제되었습니다!');
    }
  }, [isDeleteSuccess]);

  // 삭제 실패 시 처리
  useEffect(() => {
    if (isDeleteError) {
      console.log('❌ [화면] 스포츠 카테고리 삭제 실패!');
      showErrorMessage('스포츠 카테고리 삭제에 실패했습니다.');
    }
  }, [isDeleteError]);

  // 추가 성공 시 처리
  useEffect(() => {
    if (isAddSuccess) {
      console.log('✅ [화면] 스포츠 카테고리 추가 성공!');
      showSuccessMessage('스포츠 카테고리가 추가되었습니다!');
    }
  }, [isAddSuccess]);

  // 추가 실패 시 처리
  useEffect(() => {
    if (isAddError) {
      console.log('❌ [화면] 스포츠 카테고리 추가 실패!');
      showErrorMessage('스포츠 카테고리 추가에 실패했습니다.');
    }
  }, [isAddError]);

  const handleEditSport = (sport: Sport) => {
    setSportToEdit(sport);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedSport: Sport) => {
    setSports(prev => prev.map(s => s.id === updatedSport.id ? updatedSport : s));
    setShowEditModal(false);
    setSportToEdit(null);
    
    // 수정 완료 토스트 표시
    showSuccessMessage('수정되었습니다');
  };

  const handleDeleteSport = (sport: Sport) => {
    setSportToDelete(sport);
    setShowDeleteModal(true);
  };

  const confirmDeleteSport = () => {
    if (sportToDelete) {
      // API 호출하여 스포츠 카테고리 삭제
      deleteSportsCategory(sportToDelete.name);
      
      // 로컬 상태 업데이트
      setSports(prev => prev.filter(s => s.id !== sportToDelete.id));
      setShowDeleteModal(false);
      setSportToDelete(null);
    }
  };

  const cancelDeleteSport = () => {
    setShowDeleteModal(false);
    setSportToDelete(null);
  };

  const cancelEditSport = () => {
    setShowEditModal(false);
    setSportToEdit(null);
  };

  const handleAddNewSport = () => {
    setShowPlusModal(true);
  };

  const handleSaveNewSport = (newSport: {
    name: string;
    platforms: string[];
    availableSeats: number;
  }) => {
    // 새 ID 생성 (간단한 방식)
    const newId = (Math.max(...sports.map(s => parseInt(s.id))) + 1).toString();
    
    const sportToAdd: Sport = {
      id: newId,
      ...newSport,
    };
    
    // 로컬 상태 업데이트
    setSports(prev => [...prev, sportToAdd]);
    
    // API 호출하여 스포츠 카테고리 추가
    addSportsCategory(newSport.name);
    
    // 모달 닫기
    setShowPlusModal(false);
  };

  const handleSave = () => {
    // 저장 완료 토스트 표시
    showSuccessMessage('저장되었습니다');
    
    // 2초 후 이전 화면으로 이동
    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  const handleCancelPlus = () => {
    setShowPlusModal(false);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* 스포츠 목록 */}
        {sports.map((sport) => (
          <View key={sport.id} className="flex-row justify-between items-center p-4 mb-4 rounded-xl border border-gray-200">
            <View className='flex-col justify-between items-start'>
              {/* 스포츠 이름 */}
              <Text className="mb-2 text-lg font-semibold text-gray-800">{sport.name}</Text>
              
              {/* 플랫폼/채널 */}
              <Text className="mb-2 text-sm text-gray-600">
                {sport.platforms.join(', ')}
              </Text>
              
              {/* 시청 가능 좌석 */}
              <Text className="mb-3 text-sm text-gray-600">
                시청 가능 좌석: {sport.availableSeats}개
              </Text>
            </View>
            
            {/* 편집/삭제 버튼 */}
            <View className="flex-row gap-2 justify-end">
              <TouchableOpacity 
                className="justify-center items-center w-10 h-10 rounded-full bg-mainGray"
                onPress={() => handleEditSport(sport)}
                activeOpacity={0.7}
              >
                <Feather name="edit-3" size={16} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="justify-center items-center w-10 h-10 bg-red-100 rounded-full"
                onPress={() => handleDeleteSport(sport)}
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={16} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="px-4 pb-12 bg-white border-t-2 border-mainGray">
        <View className="flex-row gap-3 pt-4">
          {/* 새 스포츠 추가 버튼 */}
          <TouchableOpacity 
            className="flex-row justify-center items-center px-6 py-4 mb-4 w-full bg-orange-500 rounded-xl"
            onPress={handleAddNewSport}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={24} color="white" />
            <Text className="ml-3 text-lg font-medium text-white">새로운 스포츠 추가</Text>
          </TouchableOpacity>
          
          {/* 저장 버튼 */}
          <TouchableOpacity 
            className="flex-row justify-center items-center px-6 py-4 w-full bg-orange-500 rounded-xl"
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text className="text-lg font-medium text-white">저장</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 삭제 확인 모달 */}
      <DeleteSportModal
        visible={showDeleteModal}
        sportName={sportToDelete?.name || ''}
        onClose={cancelDeleteSport}
        onConfirm={confirmDeleteSport}
      />

      {/* 수정 모달 */}
      <EditSportModal
        visible={showEditModal}
        sport={sportToEdit}
        onClose={cancelEditSport}
        onSave={handleSaveEdit}
      />

      {/* 새 스포츠 추가 모달 */}
      <PlusSportModal
        visible={showPlusModal}
        onClose={handleCancelPlus}
        onSave={handleSaveNewSport}
      />

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
