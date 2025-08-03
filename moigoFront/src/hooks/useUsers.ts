import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyInfo,
  updateProfile,
  changePassword,
  getMatchingHistory,
  updateUserSettings,
  getUserProfile,
} from '../apis/users';
import type {
  UpdateProfileRequestDTO,
  ChangePasswordRequestDTO,
  UpdateUserSettingsRequestDTO,
} from '../types/DTO/users';

// GET /users/me - 마이페이지 정보 조회 훅
export const useGetMyInfo = () => {
  return useQuery({
    queryKey: ['my-info'],
    queryFn: () => getMyInfo(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 15 * 60 * 1000, // 15분
  });
};

// PUT /users/me - 프로필 수정 훅
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequestDTO) => updateProfile(data),
    onSuccess: () => {
      // 프로필 수정 성공 시 마이페이지 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['my-info'] });
    },
    onError: (error) => {
      console.error('프로필 수정 실패:', error);
    },
  });
};

// PUT /users/me/password - 비밀번호 변경 훅
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequestDTO) => changePassword(data),
    onError: (error) => {
      console.error('비밀번호 변경 실패:', error);
    },
  });
};

// GET /users/me/matchings - 참여한 매칭 이력 조회 훅
export const useGetMatchingHistory = () => {
  return useQuery({
    queryKey: ['matching-history'],
    queryFn: () => getMatchingHistory(),
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
  });
};

// PATCH /users/me - 사용자 설정 변경 훅
export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserSettingsRequestDTO) => updateUserSettings(data),
    onSuccess: () => {
      // 설정 변경 성공 시 마이페이지 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['my-info'] });
    },
    onError: (error) => {
      console.error('사용자 설정 변경 실패:', error);
    },
  });
};

// GET /users/{userId}/profile - 유저 정보 조회 훅
export const useGetUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 15 * 60 * 1000, // 15분
  });
}; 