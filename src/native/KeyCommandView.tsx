import { View } from 'react-native';

import type { KeyCommandViewProps } from './KeyCommandView.types';

export function KeyCommandView({ children, ...props }: KeyCommandViewProps) {
  return <View {...props}>{children}</View>;
}
