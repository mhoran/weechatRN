import { View } from 'react-native';

import type { KeyboardAvoidingViewProps } from './KeyboardAvoidingView.types';

export default function KeyboardAvoidingView({
  children,
  ...props
}: KeyboardAvoidingViewProps) {
  return <View {...props}>{children}</View>;
}
