import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-worklets', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return
  require('react-native-worklets/src/mock')
);

jest.mock('@expo/ui', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Host: RN.View,
    List: RN.View,
    Switch: RN.Switch,
    TextInput: RN.TextInput,
    Text: RN.Text
  };
});
