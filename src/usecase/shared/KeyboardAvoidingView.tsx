import { type ViewStyle } from 'react-native';
import Animated, {
  KeyboardState,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useDerivedValue
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

  const offset = useDerivedValue(() => {
    return Math.max(keyboard.height.value - safeAreaInsets.bottom, 0);
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
    <Animated.View style={[style, offsetStyle, paddingTop]}>
      {children}
    </Animated.View>
  );
};
