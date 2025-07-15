module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src', // '@/App' → 'moigoFront/App'
        },
      },
    ],
    'nativewind/babel',
  ],
};
