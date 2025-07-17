module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
      // [
      //   'module-resolver',
      //   {
      //     root: ['./'],
      //     extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      //     alias: {
      //       '@' : './src/',
      //       '@components': './src/components',
      //       '@screens': './src/screens',
      //       '@utils': './src/utils',
      //       // 추가적인 alias 설정 가능
      //     },
      //   },
      // ],
    ],
  };
};