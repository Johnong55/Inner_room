import { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

const { height, width } = Dimensions.get('window');
const drops = Array.from({ length: 18 }, (_, index) => ({
  left: ((index * 47) % 101) / 100 * width,
  length: 14 + (index % 4) * 8,
  delay: (index % 7) * 370,
  duration: 2300 + (index % 5) * 380,
  opacity: 0.08 + (index % 3) * 0.035,
}));

function Drop({ left, length, delay, duration, opacity }: (typeof drops)[number]) {
  const y = useSharedValue(-80);
  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withTiming(height + 100, { duration, easing: Easing.linear }), -1, false));
  }, [delay, duration, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[{ position: 'absolute', left, top: 0, width: 1, height: length, borderRadius: 1, backgroundColor: '#b7ced5', opacity }, style]} />;
}

export function RainOverlay() {
  return <View pointerEvents="none" className="absolute inset-0 overflow-hidden">{drops.map((drop, index) => <Drop key={index} {...drop} />)}</View>;
}
