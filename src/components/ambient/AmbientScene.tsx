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
  if (scene === 'forest') return <LinearGradient colors={['#07100e', '#10201a', '#182a21']} className="absolute inset-0"><View className="absolute bottom-0 left-0 right-0 h-[58%] flex-row items-end justify-around opacity-80">{[150, 230, 180, 280, 210].map((height, index) => <Drift key={index} distance={4 + index} duration={7000 + index * 700}><View style={{ height, width: 34, backgroundColor: index % 2 ? '#142b21' : '#193427', borderTopLeftRadius: 24, borderTopRightRadius: 24 }} /></Drift>)}</View></LinearGradient>;
  return <LinearGradient colors={['#07141b', '#0d2832', '#23434a']} className="absolute inset-0"><View className="absolute bottom-0 left-0 right-0 h-[46%] overflow-hidden">{[0, 1, 2, 3].map((index) => <View key={index} className="absolute left-[-15%] right-[-15%] rounded-[50%]" style={{ top: index * 56, height: 120, backgroundColor: index % 2 ? '#244b54' : '#1a3a45', opacity: .7 - index * .08 }}><Drift distance={18 + index * 8} duration={9000 + index * 1200}><View /></Drift></View>)}</View></LinearGradient>;
}
