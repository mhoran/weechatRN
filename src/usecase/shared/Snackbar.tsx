import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

interface SnackbarProps {
  message: string;
  onDismiss: () => void;
}

export const Snackbar: React.FC<SnackbarProps> = ({ message, onDismiss }) => {
  const translateX = useSharedValue(0);
  const panning = useSharedValue(false);
  const { width: windowWidth } = useWindowDimensions();

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          panning.value = true;
        })
        .onChange((event) => {
          translateX.value = event.translationX;
        })
        .onFinalize(() => {
          const shouldDismiss = Math.abs(translateX.value) > windowWidth * 0.3;
          if (shouldDismiss) {
            translateX.value = withTiming(
              translateX.value > 0 ? windowWidth : -windowWidth,
              undefined,
              () => runOnJS(onDismiss)()
            );
          } else {
            translateX.value = withSpring(0);
          }
          panning.value = false;
        })
        .withTestId('snackbarPan'),
    [panning, translateX, windowWidth, onDismiss]
  );

  const transformStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: withTiming(panning.value ? 1.15 : 1) }
    ]
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[styles.snackView, transformStyle]}
        accessible
        role="alert"
      >
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  snackView: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  text: {
    color: '#eee'
  }
});
