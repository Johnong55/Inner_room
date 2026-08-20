import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AmbientScene, type SceneId } from "@/components/ambient/AmbientScene";
import { PressableScale } from "@/components/ui/PressableScale";
import { Type } from "@/components/ui/Type";
import { palette } from "@/constants/theme";

const scenes: { id: SceneId; label: string }[] = [
  { id: "rain", label: "Mưa" },
  { id: "forest", label: "Rừng" },
  { id: "night", label: "Đêm" },
  { id: "ocean", label: "Biển" },
];

export default function QuietScreen() {
  const router = useRouter();
  const [scene, setScene] = useState<SceneId>("rain");
  const [seconds, setSeconds] = useState<number | null>(null);
  const breath = useSharedValue(0.75);
  useEffect(() => {
    breath.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 4800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.75, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [breath]);
  useEffect(() => {
    if (seconds === null || seconds <= 0) return;
    const timer = setInterval(
      () =>
        setSeconds((value) => (value === null ? null : Math.max(0, value - 1))),
      1000,
    );
    return () => clearInterval(timer);
  }, [seconds]);
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
    opacity: 0.2 + breath.value * 0.22,
  }));
  return (
    <View className="flex-1 bg-ink">
      <AmbientScene scene={scene} />
      <SafeAreaView className="flex-1 justify-between px-5 py-3">
        <View className="flex-row items-center justify-between">
          <PressableScale
            accessibilityLabel="Rời Quiet Room"
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: palette.controlGlass }}
          >
            <ChevronLeft color={palette.cream} size={20} />
          </PressableScale>
          <PressableScale
            onPress={() => setSeconds((value) => (value === null ? 300 : null))}
            className="flex-row items-center rounded-full px-4 py-3"
            style={{ backgroundColor: palette.controlGlass }}
          >
            <Type variant="small">
              {seconds === null
                ? "Không hẹn giờ"
                : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`}
            </Type>
          </PressableScale>
        </View>
        <View className="items-center">
          <View className="h-44 w-44 items-center justify-center">
            <Animated.View
              className="absolute h-28 w-28 rounded-full"
              style={[{ backgroundColor: palette.cream }, circleStyle]}
            />
            <Type variant="heading">Hít vào</Type>
            <Type muted className="mt-2">
              … rồi thở ra
            </Type>
          </View>
        </View>
        <View>
          <View className="mb-6 flex-row justify-center gap-2">
            {scenes.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setScene(item.id)}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor:
                    scene === item.id
                      ? palette.mossWashStrong
                      : palette.controlGlass,
                }}
              >
                <Type variant="small">{item.label}</Type>
              </Pressable>
            ))}
          </View>
          <Type
            variant="small"
            className="text-center"
            style={{ color: palette.creamMuted }}
          >
            Không cần hoàn thành điều gì ở đây.
          </Type>
        </View>
      </SafeAreaView>
    </View>
  );
}
