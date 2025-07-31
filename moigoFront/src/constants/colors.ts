// src/constants/colors.ts

// 메인 브랜드 컬러
export const COLORS = {
  // 메인 컬러
  mainOrange: '#FF6B00',
  mainWhite: '#FFFFFF',
  
  // 그레이 스케일
  mainGray: '#F3F4F6',
  mainDark: '#374151',
  mainDarkGray: '#6B7280',
  mainGrayText: '#4B5563',
  mainLightGrayText: '#9CA3AF',
  
  // 상태별 컬러
  mainRed: '#EF4444',
  bizButton: '#1F2937',
  
  // 기능별 컬러
  recruitBg: '#FEF9C3',
  recruitText: '#CA8404',
  reserveBg: '#DBEAFE',
  reserveText: '#2563EB',
  confirmBg: '#DCFCE7',
  confirmText: '#16A34A',
  chatBg: '#EF4444',
  payInfoBg: '#FFF7ED',
  requiredStar: '#EF4444',
  
  // 소셜 로그인 컬러
  kakaoYellow: '#FEE500',
  naverGreen: '#03C75A',
} as const;

// 타입 정의 (타입 안전성을 위해)
export type ColorKey = keyof typeof COLORS; 