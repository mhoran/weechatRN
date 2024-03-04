jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist');
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers)
  };
});

import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: '',
  MaterialCommunityIcons: ''
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn()
}));
