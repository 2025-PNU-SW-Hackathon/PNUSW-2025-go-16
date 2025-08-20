module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { 
        jsxImportSource: "nativewind",
        web: { 
          unstable_transformProfile: 'default' 
        }
      }],
      "nativewind/babel",
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src/',
            '@components': './src/components',
            '@screens': './src/screens',
            '@utils': './src/utils',
          },
        },
      ],
    ],
  };
};