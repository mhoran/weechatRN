import { useCallback } from 'react';
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native';
import { Platform, useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, {
  KeyboardState,
  runOnUI,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  style?: ViewStyle;
  behavior?: string;
  keyboardVerticalOffset?: number;
}

export const KeyboardAvoidingView: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  style,
  behavior,
  keyboardVerticalOffset = 0
}) => {
  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true
  });
  const currentFrame = useSharedValue<LayoutRectangle | null>(null);
  const { height: screenHeight } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? safeAreaInsets.top : 0;

  const setCurrentFrame = useCallback(
    (layout: LayoutRectangle) => {
      'worklet';
      currentFrame.value = layout;
    },
    [currentFrame]
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      runOnUI(setCurrentFrame)(event.nativeEvent.layout);
    },
    [setCurrentFrame]
  );

  const offset = useDerivedValue(() => {
    const frame = currentFrame.value;
    if (!frame) return 0;

    return Math.max(
      frame.y +
        frame.height -
        (screenHeight +
          topInset -
          keyboard.height.value -
          keyboardVerticalOffset),
      0
    );
  });

  const offsetStyle = useAnimatedStyle(() => {
    const style: ViewStyle = {};
    if (behavior === 'padding') style.paddingBottom = offset.value;
    else if (behavior === 'transform')
      style.transform = [{ translateY: -offset.value }];
    return style;
  });

  const paddingTop = useAnimatedStyle(() => {
    const style: ViewStyle = {};
    if (behavior === 'transform')
      style.paddingTop =
        keyboard.state.value === KeyboardState.OPEN ? offset.value : 0;
    return style;
  });

  return (
    <Animated.View onLayout={onLayout} style={[style, offsetStyle, paddingTop]}>
      {children}
    </Animated.View>
  );
};
