import { useCallback } from 'react';
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native';
import { Platform, useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, {
  KeyboardState,
  runOnUI,
  useAnimatedKeyboard,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  style?: ViewStyle;
  behavior: string;
}

export const KeyboardAvoidingView: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  style,
  behavior
}) => {
  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true
  });
  const currentFrame = useSharedValue<LayoutRectangle | null>(null);
  const { height: screenHeight } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? safeAreaInsets.top : 0;

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
        (screenHeight + topPadding - keyboard.height.value),
      0
    );
  });

  const paddingTop = useSharedValue<number | null>(null);

  useAnimatedReaction(
    () => keyboard.state.value,
    (newState, oldState) => {
      if (newState === oldState) paddingTop.value = null;
      else if (newState === KeyboardState.OPEN) paddingTop.value = offset.value;
      else paddingTop.value = 0;
    }
  );

  const offsetStyle = useAnimatedStyle(() => {
    if (behavior === 'padding') {
      return { paddingBottom: offset.value };
    } else if (behavior === 'transform') {
      const style: ViewStyle = {
        transform: [{ translateY: -offset.value }]
      };
      if (paddingTop.value !== null) {
        style.paddingTop = paddingTop.value;
      }
      return style;
    } else {
      return {};
    }
  });

  return (
    <Animated.View onLayout={onLayout} style={[style, offsetStyle]}>
      {children}
    </Animated.View>
  );
};
