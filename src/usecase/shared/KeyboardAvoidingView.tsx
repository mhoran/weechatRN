import { useCallback } from 'react';
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native';
import { Platform, useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, {
  KeyboardState,
  runOnUI,
  useAnimatedKeyboard,
  useAnimatedStyle,
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

  const animatedStyles = useAnimatedStyle(() => {
    if (!currentFrame.value) return {};

    const offset = Math.max(
      currentFrame.value.y +
        currentFrame.value.height -
        (screenHeight + topPadding - keyboard.height.value),
      0
    );

    if (behavior === 'padding') {
      return { paddingBottom: offset };
    } else if (behavior === 'transform') {
      return {
        transform: [{ translateY: -offset }],
        paddingTop: keyboard.state.value === KeyboardState.OPEN ? offset : 0
      };
    } else {
      return {};
    }
  });

  return (
    <Animated.View onLayout={onLayout} style={[style, animatedStyles]}>
      {children}
    </Animated.View>
  );
};
