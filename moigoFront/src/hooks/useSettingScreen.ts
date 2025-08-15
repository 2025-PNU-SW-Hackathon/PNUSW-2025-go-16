import { useState } from 'react';
import { useStoreInfo, useUpdateStoreBasicInfo } from './queries/useUserQueries';
import type { StoreBasicInfoRequestDTO } from '../types/DTO/users';

export const useSettingScreen = () => {
  // 가게 정보 조회
  const {
    data: storeInfoData,
    isLoading: isStoreInfoLoading,
    error: storeInfoError,
    refetch: refetchStoreInfo,
  } = useStoreInfo();

  // 가게 기본 정보 수정
  const {
    mutate: updateStoreBasicInfo,
    isPending: isUpdating,
    error: updateError,
    isSuccess: isSaveSuccess,
    isError: isSaveError,
  } = useUpdateStoreBasicInfo();

  // 가게 기본 정보 수정 폼 상태
  const [basicInfoForm, setBasicInfoForm] = useState<StoreBasicInfoRequestDTO>({
    store_name: '',
    address_main: '',
    address_detail: '',
    phone_number: '',
    business_reg_no: '',
    owner_name: '',
    email: '',
    bio: '',
  });

  // 폼 초기화
  const initializeForm = () => {
    if (storeInfoData?.data?.store_info) {
      const storeInfo = storeInfoData.data.store_info;
      setBasicInfoForm({
        store_name: storeInfo.store_name || '',
        address_main: storeInfo.address_main || '',
        address_detail: storeInfo.address_detail || '',
        phone_number: storeInfo.phone_number || '',
        business_reg_no: storeInfo.business_reg_no || '',
        owner_name: storeInfo.owner_name || '',
        email: storeInfo.email || '',
        bio: storeInfo.bio || '',
      });
    }
  };

  // 폼 필드 업데이트
  const updateFormField = (field: keyof StoreBasicInfoRequestDTO, value: string) => {
    setBasicInfoForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 가게 기본 정보 저장
  const handleSaveBasicInfo = async () => {
    try {
      await updateStoreBasicInfo(basicInfoForm);
    } catch (error) {
      console.error('❌ [설정] 가게 기본 정보 저장 실패:', error);
    }
  };

  // 가게 정보
  const storeInfo = storeInfoData?.data?.store_info;
  const hasError = storeInfoError || updateError;

  return {
    // 상태
    storeInfo,
    basicInfoForm,
    isLoading: isStoreInfoLoading,
    isUpdating,
    hasError,
    isSaveSuccess,
    isSaveError,
    
    // 액션
    updateFormField,
    handleSaveBasicInfo,
    initializeForm,
    refetchStoreInfo,
  };
};
