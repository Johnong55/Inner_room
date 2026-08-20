import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ImageBackground, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

import { RainOverlay } from './RainOverlay';

export type SceneId = 'rain' | 'forest' | 'night' | 'ocean';

function Drift({ children, distance = 16, duration = 8000 }: { children: ReactNode; distance?: number; duration?: number }) {
  const move = useSharedValue(-distance);
  useEffect(() => { move.value = withRepeat(withTiming(distance, { duration, easing: Easing.inOut(Easing.sin) }), -1, true); }, [distance, duration, move]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: move.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

export function AmbientScene({ scene }: { scene: SceneId }) {
  if (scene === 'rain') return <ImageBackground source={require('@/assets/images/innerroom/rainy-room-v2.png')} resizeMode="cover" className="absolute inset-0"><View className="absolute inset-0" style={{ backgroundColor: 'rgba(4,10,12,.3)' }} /><RainOverlay /></ImageBackground>;
  if (scene === 'night') return <LinearGradient colors={['#071019', '#111d26', '#17201f']} className="absolute inset-0"><View className="absolute right-12 top-32 h-20 w-20 rounded-full" style={{ backgroundColor: '#d8d1b8', shadowColor: '#fff7d7', shadowOpacity: .22, shadowRadius: 30 }} /><View className="absolute inset-x-0 top-44 opacity-60"><Drift distance={34} duration={16000}><View className="h-16 w-64 rounded-full" style={{ backgroundColor: '#28343a' }} /></Drift></View></LinearGradient>;
  if (scene === 'forest') return <ImageBackground source={require('@/assets/images/innerroom/forest-room.png')} resizeMode="cover" className="absolute inset-0"><View className="absolute inset-0" style={{ backgroundColor: 'rgba(4,8,7,.22)' }} /></ImageBackground>;
  return <ImageBackground source={require('@/assets/images/innerroom/ocean-room.png')} resizeMode="cover" className="absolute inset-0"><View className="absolute inset-0" style={{ backgroundColor: 'rgba(4,8,10,.2)' }} /></ImageBackground>;
}
