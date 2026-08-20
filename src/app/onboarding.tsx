import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, Pressable, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { RainOverlay } from "@/components/ambient/RainOverlay";
import {
  MoodMoment,
  type MoodNextActivity,
} from "@/components/mood/MoodMoment";
import { MoodPicker } from "@/components/mood/MoodPicker";
import { Button } from "@/components/ui/Button";
import { Type } from "@/components/ui/Type";
import { palette } from "@/constants/theme";
import { saveMoodCheckIn } from "@/database";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import type { MoodId } from "@/types";

export default function OnboardingScreen() {
  const router = useRouter();
  const update = usePreferencesStore((state) => state.update);
  const [copyIndex, setCopyIndex] = useState(0);
  const [stage, setStage] = useState<"scene" | "truth" | "mood">("scene");
  const [mood, setMood] = useState<MoodId | null>(null);
  const [momentMood, setMomentMood] = useState<MoodId | null>(null);

  useEffect(() => {
    if (stage !== "scene") return;
    const timer = setTimeout(() => setCopyIndex(1), 3100);
    return () => clearTimeout(timer);
  }, [stage]);

  const finish = async (destination: MoodNextActivity["href"] = "/(tabs)") => {
    if (mood) await saveMoodCheckIn(mood);
    await update({ hasOnboarded: true });
    router.replace(destination);
  };

  const chooseMood = (next: MoodId) => {
    setMood(next);
    setMomentMood(next);
  };

  if (stage === "mood") {
    return (
      <SafeAreaView className="flex-1 bg-ink px-5">
        <Animated.View
          entering={FadeIn.duration(850)}
          className="flex-1 justify-center"
        >
          <Type variant="eyebrow" muted>
            CHỈ MỘT LỜI CHECK-IN
          </Type>
          <Type variant="title" className="mb-3 mt-4">
            Hôm nay bạn đang cảm thấy thế nào?
          </Type>
          <Type muted className="mb-9">
            Không có câu trả lời đúng. Bạn cũng có thể bỏ qua.
          </Type>
          <MoodPicker value={mood} onChange={chooseMood} />
        </Animated.View>
        <View className="gap-3 pb-4">
          <Button label="Bắt đầu" onPress={() => void finish()} />
          <Pressable
            accessibilityRole="button"
            onPress={() => void finish()}
            className="items-center py-3"
          >
            <Type muted>Bỏ qua lúc này</Type>
          </Pressable>
        </View>
        <MoodMoment
          moodId={momentMood}
          onChoose={(activity) => {
            setMomentMood(null);
            void finish(activity.href);
          }}
          onClose={() => setMomentMood(null)}
          visible={momentMood !== null}
        />
      </SafeAreaView>
    );
  }

  if (stage === "truth") {
    return (
      <SafeAreaView className="flex-1 justify-between bg-ink px-6 py-6">
        <Animated.View
          entering={FadeIn.duration(900)}
          className="flex-1 justify-center"
        >
          <Type variant="display">Bạn không cần phải ổn ngay lúc này.</Type>
          <Type variant="heading" muted className="mt-8 max-w-[320px]">
            Chỉ cần thành thật với bản thân mình.
          </Type>
        </Animated.View>
        <Button label="Tiếp tục" onPress={() => setStage("mood")} />
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/innerroom/rainy-room-v2.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <LinearGradient
        colors={["rgba(5,11,15,.24)", "rgba(5,11,15,.40)", "rgba(7,15,19,.94)"]}
        locations={[0, 0.55, 1]}
        className="absolute inset-0"
      />
      <RainOverlay />
      <SafeAreaView className="flex-1 justify-end px-6 pb-7">
        <View className="min-h-[190px] justify-end">
          <Animated.View
            key={copyIndex}
            entering={FadeIn.duration(900)}
            exiting={FadeOut.duration(700)}
            layout={LinearTransition.duration(800)}
          >
            <Type variant="display">
              {copyIndex === 0
                ? "Có những ngày mình chẳng biết phải đi đâu tiếp."
                : "Không sao cả nếu hôm nay bạn chỉ muốn ngồi lại và hiểu mình một chút."}
            </Type>
          </Animated.View>
        </View>
        <Type muted className="mb-8 mt-5">
          Một căn phòng nhỏ, chỉ thuộc về bạn.
        </Type>
        <Button label="Vào phòng" onPress={() => setStage("truth")} />
        <Type
          variant="small"
          className="mt-4 text-center"
          style={{ color: palette.fog }}
        >
          Riêng tư từ thiết kế · Không cần tài khoản
        </Type>
      </SafeAreaView>
    </ImageBackground>
  );
}
