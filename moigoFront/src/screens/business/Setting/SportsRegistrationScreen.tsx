import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/RootStackParamList';
import { Feather } from '@expo/vector-icons';
import Toast from '@/components/common/Toast';
import DeleteSportModal from '@/components/business/DeleteSportModal';
import EditSportModal from '@/components/business/EditSportModal';
import PlusSportModal from '@/components/business/PlusSportModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SportsRegistration'>;

interface Sport {
  id: string;
  name: string;
  platforms: string[];
  availableSeats: number;
}

export default function SportsRegistrationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
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

  const handleEditSport = (sport: Sport) => {
    setSportToEdit(sport);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedSport: Sport) => {
    setSports(prev => prev.map(s => s.id === updatedSport.id ? updatedSport : s));
    setShowEditModal(false);
    setSportToEdit(null);
    
    // 수정 완료 토스트 표시
    setShowToast(true);
    setToastMessage('수정되었습니다');
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleDeleteSport = (sport: Sport) => {
    setSportToDelete(sport);
    setShowDeleteModal(true);
  };

  const confirmDeleteSport = () => {
    if (sportToDelete) {
      setSports(prev => prev.filter(s => s.id !== sportToDelete.id));
      setShowDeleteModal(false);
      setSportToDelete(null);
      
      // 삭제 완료 토스트 표시
      setShowToast(true);
      setToastMessage('삭제되었습니다');
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
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
    
    setSports(prev => [...prev, sportToAdd]);
    
    // 추가 완료 토스트 표시
    setShowToast(true);
    setToastMessage('추가되었습니다');
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleSave = () => {
    // 저장 로직
    console.log('저장된 스포츠 데이터:', sports);
    
    // 토스트 표시
    setShowToast(true);
    
    // 2초 후 이전 화면으로 이동
    setTimeout(() => {
      setShowToast(false);
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
      {showToast && (
        <Toast 
          visible={showToast}
          message={toastMessage} 
          type="success"
          onHide={() => setShowToast(false)}
        />
      )}
    </View>
  );
}
