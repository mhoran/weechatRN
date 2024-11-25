import { useCallback } from 'react';
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native';
import { Platform, useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const KeyboardAvoidingView: React.FC<
  React.PropsWithChildren<{ style: ViewStyle }>
> = ({ children, style }) => {
  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true
  });
  const currentFrame = useSharedValue<LayoutRectangle | null>(null);
  const { height: screenHeight } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'android' ? safeAreaInsets.top : 0;

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      currentFrame.value = event.nativeEvent.layout;
    },
    [currentFrame]
  );

  const animatedStyles = useAnimatedStyle(() => {
    if (!currentFrame.value) return {};
    const translateY = -Math.max(
      currentFrame.value.y +
        currentFrame.value.height -
        (screenHeight + topPadding - keyboard.height.value),
      0
    );

    return { transform: [{ translateY }] };
  });

  return (
    <Animated.View onLayout={onLayout} style={[style, animatedStyles]}>
      {children}
    </Animated.View>
  );
};
