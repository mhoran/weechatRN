import { requireNativeViewManager } from 'expo-modules-core';
import type * as React from 'react';
import { useCallback, useState } from 'react';
import { LayoutAnimation } from 'react-native';

import type { KeyboardAvoidingViewProps } from './KeyboardAvoidingView.types';

type KeyboardHeightChangedEvent = {
  nativeEvent: { height: number, duration: number}
}
type NativeViewProps = KeyboardAvoidingViewProps & {
  onKeyboardHeightChanged: (event: KeyboardHeightChangedEvent) => void
}

const NativeView: React.ComponentType<NativeViewProps> =
  requireNativeViewManager('KeyboardAvoidingView');

export default function KeyboardAvoidingView({
  children,
  style,
  ...props
}: KeyboardAvoidingViewProps) {
  const [keyboardHeight, setKeyboardHeight] = useState<number>();

  const onKeyboardHeightChanged = useCallback(
    ({ nativeEvent: { height, duration } }: KeyboardHeightChangedEvent) => {
      console.log(height, duration)
      setKeyboardHeight(height);

      if (duration === 0) return;

      LayoutAnimation.configureNext({
        duration: duration > 10 ? duration : 10,
        update: {
          duration: duration > 10 ? duration : 10,
          type: 'keyboard'
        }
      });
    },
    []
  );

  return (
    <NativeView
      {...props}
      style={[style, {paddingBottom: keyboardHeight}]}
      onKeyboardHeightChanged={onKeyboardHeightChanged}
    >
      {children}
    </NativeView>
  );
}
