module.exports = {
  preset: 'jest-expo',
  transform: {
    '\\.m?[jt]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-redux|@shopify/flash-list|immer|emoji-regex)'
  ],
  setupFilesAfterEnv: ['./jest-setup.ts'],
  resolver: 'react-native-reanimated/jest/resolver'
};
