// src/utils/colorUtils.ts

// 색상 밝기 계산 함수
export const getLuminance = (hex: string): number => {
  // # 제거
  const hexColor = hex.replace('#', '');
  
  // RGB 값 추출
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  // 상대 휘도 계산 (WCAG 기준)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance;
};

// 텍스트 색상 결정 함수
export const getTextColor = (backgroundColor: string): string => {
  const luminance = getLuminance(backgroundColor);
  // 밝기가 0.7보다 크면 어두운 텍스트, 작으면 밝은 텍스트
  // 주황색 배경에 흰색 텍스트가 나오도록 임계값을 높임
  return luminance > 0.7 ? '#000000' : '#FFFFFF';
};

// 색상 투명도 조절 함수
export const addOpacity = (hex: string, opacity: number): string => {
  // opacity는 0-1 사이의 값
  const alpha = Math.round(opacity * 255);
  const alphaHex = alpha.toString(16).padStart(2, '0');
  return `${hex}${alphaHex}`;
};

// 색상 밝기 조절 함수
export const adjustBrightness = (hex: string, percent: number): string => {
  const hexColor = hex.replace('#', '');
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  const newR = Math.max(0, Math.min(255, r + (r * percent / 100)));
  const newG = Math.max(0, Math.min(255, g + (g * percent / 100)));
  const newB = Math.max(0, Math.min(255, b + (b * percent / 100)));
  
  return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
}; 