import { StyleSheet, Text, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

interface SnackbarProps {
  message: string;
  onDismiss: () => void;
}

export const Snackbar: React.FC<SnackbarProps> = ({ message, onDismiss }) => {
  const translateX = useSharedValue(0);
  const panning = useSharedValue(false);
  const { width: windowWidth } = useWindowDimensions();

  const panGesture = usePanGesture({
    onBegin: () => {
      panning.set(true);
    },
    onUpdate: (event) => {
      translateX.set(event.translationX);
    },
    onFinalize: () => {
      const shouldDismiss = Math.abs(translateX.value) > windowWidth * 0.3;
      if (shouldDismiss) {
        translateX.set(
          withTiming(
            translateX.value > 0 ? windowWidth : -windowWidth,
            undefined,
            () => scheduleOnRN(onDismiss)
          )
        );
      } else {
        translateX.set(withSpring(0));
      }
      panning.set(false);
    },
    testID: 'snackbarPan'
  });

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
