import type { StyleProp, ViewStyle } from 'react-native';

export type KeyCommandViewProps = {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  onShiftEnter: () => void;
  onTab: () => void;
};
