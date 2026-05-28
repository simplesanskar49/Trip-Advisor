import { colors } from '@/lib/theme';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type SkeletonProps = {
  width?: number | string;
  height?: number;
  rounded?: number;
  className?: string;
};

export function Skeleton({ width = '100%', height = 16, rounded = 8, className }: SkeletonProps) {
  const opacity = useSharedValue(0.4);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.8, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View
      className={className}
      style={{ width: width as number, height, borderRadius: rounded, overflow: 'hidden' }}
    >
      <Animated.View style={[{ flex: 1, backgroundColor: colors.skeleton }, animatedStyle]} />
    </View>
  );
}
