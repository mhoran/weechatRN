import { requireNativeViewManager } from 'expo-modules-core';
import type * as React from 'react';

import type { KeyCommandViewProps } from './KeyCommandView.types';

const NativeView: React.ComponentType<KeyCommandViewProps> =
  requireNativeViewManager('KeyCommandModule');

export function KeyCommandView({
  children,
  style,
  ...props
}: KeyCommandViewProps) {
  return (
    <NativeView {...props} style={style}>
      {children}
    </NativeView>
  );
}
