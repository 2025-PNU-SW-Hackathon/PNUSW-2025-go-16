# 모이GO - React Native 앱

## 🚀 자동 배포

이 프로젝트는 `dev-front` 브랜치에 머지될 때마다 자동으로 EAS 빌드가 실행됩니다.

### 설정 방법

1. **Expo 토큰 생성**
   - https://expo.dev/accounts/sehankim/settings/access-tokens 접속
   - "Create token" 클릭
   - 토큰 이름: `GitHub Actions Auto Deploy`

2. **GitHub Secrets 설정**
   - GitHub 저장소 → Settings → Secrets and variables → Actions
   - "New repository secret" 클릭
   - Name: `EXPO_TOKEN`
   - Value: 위에서 생성한 토큰

3. **자동 배포 확인**
   - `dev-front` 브랜치에 머지하면 자동으로 iOS/Android 빌드 실행
   - GitHub Actions 탭에서 진행 상황 확인 가능

### 수동 빌드

```bash
# iOS 빌드
eas build --platform ios --profile preview

# Android 빌드  
eas build --platform android --profile preview
```

## 📱 앱 실행

### 개발 모드
```bash
npm start
```

### 빌드된 앱 설치
- QR 코드 스캔 또는 링크 접속
- iOS: 개발자 모드 활성화 필요

## 🛠 기술 스택

- React Native
- Expo
- TypeScript
- Tailwind CSS (NativeWind)
- Zustand (상태 관리)
- React Navigation

## 📁 프로젝트 구조

```
moigoFront/
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── screens/        # 화면 컴포넌트
│   ├── hooks/          # 커스텀 훅
│   ├── store/          # Zustand 스토어
│   ├── types/          # TypeScript 타입 정의
│   └── utils/          # 유틸리티 함수
├── .github/workflows/  # GitHub Actions 워크플로우
└── eas.json           # EAS 빌드 설정
``` 