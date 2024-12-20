import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEvent = {
  height: number;
};

export type KeyboardAvoidingViewProps = {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  onKeyboardHeightChange?: (event: { nativeEvent: OnLoadEvent }) => void;
};
