const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // import.meta 문제 해결
  config.resolve.fallback = {
    ...config.resolve.fallback,
    module: false,
  };
  
  // ES 모듈 설정
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });
  
  return config;
};





