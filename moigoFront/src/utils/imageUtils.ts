/**
 * 이미지 URL 유틸리티 함수들
 */

/**
 * 가게 썸네일 URL을 안전하게 처리하는 함수
 * @param thumbnailUrl - 원본 썸네일 URL
 * @param baseUrl - 기본 서버 URL (선택사항)
 * @returns 처리된 썸네일 URL 또는 null
 */
export function sanitizeThumbnailUrl(thumbnailUrl: string | null | undefined, baseUrl?: string): string | null {
  // null, undefined, 빈 문자열 체크
  if (!thumbnailUrl || thumbnailUrl.trim() === '') {
    console.log('⚠️ [imageUtils] 썸네일 URL이 비어있음:', thumbnailUrl);
    return null;
  }
  
  const cleanUrl = thumbnailUrl.trim();
  
  // 이미 완전한 URL인 경우
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    console.log('✅ [imageUtils] 완전한 URL:', cleanUrl);
    return cleanUrl;
  }
  
  // 상대 경로인 경우 기본 URL과 결합
  if (baseUrl && cleanUrl.startsWith('/')) {
    const fullUrl = baseUrl.replace(/\/$/, '') + cleanUrl;
    console.log('🔗 [imageUtils] 상대 경로를 완전한 URL로 변환:', {
      original: cleanUrl,
      baseUrl: baseUrl,
      result: fullUrl
    });
    return fullUrl;
  }
  
  // 파일명만 있는 경우 (예: "store1.jpg")
  if (baseUrl && !cleanUrl.includes('/')) {
    const fullUrl = `${baseUrl.replace(/\/$/, '')}/images/stores/${cleanUrl}`;
    console.log('📁 [imageUtils] 파일명을 완전한 URL로 변환:', {
      original: cleanUrl,
      baseUrl: baseUrl,
      result: fullUrl
    });
    return fullUrl;
  }
  
  // 처리할 수 없는 형태
  console.log('❌ [imageUtils] 처리할 수 없는 URL 형태:', cleanUrl);
  return null;
}

/**
 * 기본 이미지 URL 생성 (실제 이미지가 없을 때 사용)
 * @param storeName - 가게 이름
 * @returns Placeholder 이미지 URL
 */
export function generatePlaceholderImage(storeName: string): string {
  // Placeholder 이미지 서비스 사용 (예: picsum.photos)
  const encodedName = encodeURIComponent(storeName.substring(0, 10));
  return `https://picsum.photos/400/300?random=${encodedName}`;
}

/**
 * 이미지 URL 유효성 검사
 * @param url - 검사할 URL
 * @returns URL이 유효한지 여부
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 서버 기본 URL (환경변수나 설정에서 가져와야 함)
 * 실제 프로젝트에서는 config 파일에서 관리하는 것이 좋습니다.
 */
export const DEFAULT_SERVER_BASE_URL = 'http://localhost:8080'; // 실제 서버 URL로 변경 필요

/**
 * 가게 썸네일을 안전하게 가져오는 메인 함수
 * @param thumbnailUrl - 원본 썸네일 URL
 * @param storeName - 가게 이름 (플레이스홀더용)
 * @param useePlaceholder - 플레이스홀더 사용 여부
 * @returns 안전한 이미지 URL
 */
export function getStoreThumbnail(
  thumbnailUrl: string | null | undefined,
  storeName: string = '가게',
  usePlaceholder: boolean = false
): string | null {
  // 1차: 원본 URL 정리 시도
  const sanitizedUrl = sanitizeThumbnailUrl(thumbnailUrl, DEFAULT_SERVER_BASE_URL);
  
  if (sanitizedUrl && isValidImageUrl(sanitizedUrl)) {
    return sanitizedUrl;
  }
  
  // 2차: 플레이스홀더 이미지 사용
  if (usePlaceholder) {
    console.log('🖼️ [imageUtils] 플레이스홀더 이미지 사용:', storeName);
    return generatePlaceholderImage(storeName);
  }
  
  // 3차: null 반환 (이미지 없음 처리)
  return null;
}
