const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// 태블릿에서 더 안정적인 기본 설정
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// 태블릿 최적화 설정 (단순화)
config.transformer = {
  ...config.transformer,
  // 태블릿에서 안정적인 변환 설정
  experimentalImportSupport: false,
  allowOptionalDependencies: true,
};

// 태블릿 메모리 최적화
config.maxWorkers = 1;

module.exports = withNativeWind(config, { input: './global.css' });