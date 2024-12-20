import { requireNativeViewManager } from 'expo-modules-core';
import type * as React from 'react';

import type { KeyboardAvoidingViewProps } from './KeyboardAvoidingView.types';

const NativeView: React.ComponentType<KeyboardAvoidingViewProps> =
  requireNativeViewManager('KeyboardAvoidingView');

export default function KeyboardAvoidingView({
  children,
  style,
  ...props
}: KeyboardAvoidingViewProps) {
  return (
    <NativeView {...props} style={style}>
      {children}
    </NativeView>
  );
}
