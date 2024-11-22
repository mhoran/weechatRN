import { MaterialCommunityIcons } from '@expo/vector-icons';
import type React from 'react';
import { useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

const UploadSpinner: React.FC = () => {
  const rotation = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateZ: `${rotation.value}deg`
        }
      ]
    };
  }, [rotation.value]);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear
      }),
      200
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  return (
    <AnimatedIcon
      name="loading"
      size={27}
      color="white"
      style={animatedStyles}
    />
  );
};

export default UploadSpinner;
