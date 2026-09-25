import { requireNativeViewManager } from 'expo-modules-core';
import type * as React from 'react';
import { View, type ViewProps } from 'react-native';

import type { KeyboardAvoidingViewProps } from './KeyboardAvoidingView.types';

const NativeView: React.ComponentType<KeyboardAvoidingViewProps> =
  requireNativeViewManager('KeyboardAvoidingView');

const NativeContentView: React.ComponentType<ViewProps> =
  requireNativeViewManager(
    'KeyboardAvoidingView',
    'KeyboardAvoidingContentView'
  );

export default function KeyboardAvoidingView({
  children,
  style,
  enabled = true,
  ...props
}: KeyboardAvoidingViewProps) {
  if (!enabled) {
    return <View style={style}>{children}</View>;
  }

  return (
    <NativeView {...props} style={style}>
      <NativeContentView collapsable={false}>{children}</NativeContentView>
    </NativeView>
  );
}
