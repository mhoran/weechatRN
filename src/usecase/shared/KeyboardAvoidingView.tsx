import { type ViewStyle } from 'react-native';
import Animated, {
  KeyboardState,
  useAnimatedKeyboard,
  useAnimatedStyle
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  style?: ViewStyle;
  behavior?: string;
}

export const KeyboardAvoidingView: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  style,
  behavior
}) => {
  const keyboard = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true
  });
  const safeAreaInsets = useSafeAreaInsets();

  const animatedStyles = useAnimatedStyle(() => {
    const offset = Math.max(keyboard.height.value - safeAreaInsets.bottom, 0);

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
    <Animated.View style={[style, animatedStyles]}>{children}</Animated.View>
  );
};
