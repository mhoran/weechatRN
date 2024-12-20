import { requireNativeViewManager } from 'expo-modules-core';
import type * as React from 'react';

import type { KeyboardAvoidingViewProps } from './KeyboardAvoidingView.types';
import { useState } from 'react';

const NativeView: React.ComponentType<KeyboardAvoidingViewProps> =
  requireNativeViewManager('KeyboardAvoidingView');

export default function KeyboardAvoidingView({
  children,
  style,
  ...props
}: KeyboardAvoidingViewProps) {
  const [paddingTop, setPaddingTop] = useState<number>();
  return (
    <NativeView
      {...props}
      style={[style, { paddingTop }]}
      onKeyboardHeightChange={(event) => {
        setPaddingTop(event.nativeEvent.height);
      }}
    >
      {children}
    </NativeView>
  );
}
