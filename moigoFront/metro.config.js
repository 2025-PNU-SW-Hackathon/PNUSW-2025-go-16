const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// 플랫폼 지원 설정
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// 플랫폼 헤더 문제 해결
config.transformer = {
  ...config.transformer,
  experimentalImportSupport: false,
  allowOptionalDependencies: true,
  // 플랫폼 헤더 자동 감지
  unstable_allowRequireContext: true,
  minifierConfig: {
    mangle: false,
    output: {
      ascii_only: true,
    },
  },
};

// 플랫폼별 번들 최적화
config.resolver = {
  ...config.resolver,
  alias: {
    ...config.resolver.alias,
    'react-native$': 'react-native-web',
  },
  // 플랫폼 헤더 자동 설정
  platforms: ['ios', 'android', 'native', 'web'],
};

module.exports = withNativeWind(config, { input: './global.css' });