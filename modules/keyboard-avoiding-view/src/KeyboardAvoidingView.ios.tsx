import { requireNativeViewManager } from 'expo-modules-core';
import type * as React from 'react';
import type { ViewProps } from 'react-native';

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
  ...props
}: KeyboardAvoidingViewProps) {
  return (
    <NativeView {...props} style={style}>
      <NativeContentView collapsable={false}>{children}</NativeContentView>
    </NativeView>
  );
}
