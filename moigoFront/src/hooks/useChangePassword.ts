import { useState, useEffect } from 'react';
import { useChangePassword as useChangePasswordMutation } from './queries/useUserQueries';
import { useAuthStore } from '@/store/authStore';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const useChangePassword = () => {
  const [form, setForm] = useState<ChangePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const { validatePassword, user } = useAuthStore();
  const changePasswordMutation = useChangePasswordMutation();

  // 사용자 타입에 따른 API 엔드포인트 결정
  const getApiEndpoint = () => {
    return user?.userType === 'business' 
      ? '/business/change-password' 
      : '/user/change-password';
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: ChangePasswordErrors = {};
    
    if (!form.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }
    
    if (!form.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else {
      const validation = validatePassword(form.newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = validation.errors[0];
      }
    }
    
    if (!form.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호 확인을 입력해주세요.';
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼이 유효한지 확인
  const isFormValid = (): boolean => {
    const newErrors: ChangePasswordErrors = {};
    
    if (!form.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }
    
    if (!form.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else {
      const validation = validatePassword(form.newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = validation.errors[0];
      }
    }
    
    if (!form.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호 확인을 입력해주세요.';
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    return form.currentPassword.length > 0 && 
           form.newPassword.length > 0 && 
           form.confirmPassword.length > 0 && 
           Object.keys(newErrors).length === 0;
  };

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof ChangePasswordForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // 비밀번호 변경 제출
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      // 사용자 타입에 따른 API 엔드포인트 사용
      const endpoint = getApiEndpoint();
      console.log(`비밀번호 변경 API 호출: ${endpoint} (사용자 타입: ${user?.userType})`);
      
      const result = await changePasswordMutation.mutateAsync({
        old_password: form.currentPassword,
        new_password: form.newPassword,
        endpoint, // API 엔드포인트 전달
      });
      
      if (result.success) {
        setToastMessage('비밀번호가 성공적으로 변경되었습니다');
        setToastType('success');
        setShowToast(true);
        
        // 폼 초기화
        setForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setErrors({});
        
        return { success: true };
      } else {
        // API에서 success: false로 응답한 경우
        let errorMessage = '비밀번호 변경에 실패했습니다';
        
        if (result.errorCode === 'WRONG_PASSWORD') {
          errorMessage = '현재 비밀번호가 올바르지 않습니다';
          setErrors(prev => ({ ...prev, currentPassword: errorMessage }));
        }
        
        setToastMessage(errorMessage);
        setToastType('error');
        setShowToast(true);
        
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error);
      
      let errorMessage = '비밀번호 변경에 실패했습니다';
      
      if (error?.response?.data?.errorCode === 'WRONG_PASSWORD') {
        errorMessage = '현재 비밀번호가 올바르지 않습니다';
        setErrors(prev => ({ ...prev, currentPassword: errorMessage }));
      }
      
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
      
      return { success: false, error: errorMessage };
    }
  };

  // 입력값 변경 시 실시간 유효성 검사
  useEffect(() => {
    const newErrors: ChangePasswordErrors = {};
    
    if (form.currentPassword && !form.currentPassword.trim()) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }
    
    if (form.newPassword) {
      const validation = validatePassword(form.newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = validation.errors[0];
      }
    }
    
    if (form.confirmPassword && form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    setErrors(newErrors);
  }, [form.currentPassword, form.newPassword, form.confirmPassword]);

  return {
    form,
    errors,
    showToast,
    toastMessage,
    toastType,
    isLoading: changePasswordMutation.isPending,
    handleInputChange,
    handleSubmit,
    isFormValid,
    setShowToast,
  };
}; 