import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { moods } from "@/constants/content";
import { palette } from "@/constants/theme";
import type { MoodId } from "@/types";
import { PressableScale } from "../ui/PressableScale";
import { Type } from "../ui/Type";
import { MoodGlyph } from "./MoodGlyph";

function MoodChoice({
  active,
  label,
  moodId,
  onPress,
}: {
  active: boolean;
  label: string;
  moodId: MoodId;
  onPress: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const selected = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    selected.value = reduceMotion
      ? active
        ? 1
        : 0
      : withTiming(active ? 1 : 0, {
          duration: 160,
          easing: Easing.out(Easing.cubic),
        });
  }, [active, reduceMotion, selected]);

  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selected.value,
      [0, 1],
      [palette.inkRaised, palette.creamWash],
    ),
    borderColor: interpolateColor(
      selected.value,
      [0, 1],
      [palette.line, palette.lineStrong],
    ),
    transform: [{ scale: interpolate(selected.value, [0, 1], [1, 1.015]) }],
  }));

  const glyphStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(selected.value, [0, 1], [0, -1]) },
      { scale: interpolate(selected.value, [0, 1], [1, 1.04]) },
    ],
  }));

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className="w-[23.5%]"
    >
      <Animated.View
        className="min-h-[78px] items-center justify-center rounded-[16px] border px-1 py-2"
        style={cardStyle}
      >
        <Animated.View style={glyphStyle}>
          <MoodGlyph active={active} moodId={moodId} size={30} />
        </Animated.View>
        <Type
          variant="small"
          numberOfLines={2}
          style={{
            color: active ? palette.cream : palette.fog,
            fontSize: 11,
            lineHeight: 14,
            marginTop: 3,
            textAlign: "center",
            width: "100%",
          }}
        >
          {moodId === "unsure" ? "Chưa rõ" : label}
        </Type>
      </Animated.View>
    </PressableScale>
  );
}

export function MoodPicker({
  value,
  onChange,
}: {
  value: MoodId | null;
  onChange: (mood: MoodId) => void;
}) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-2.5">
      {moods.map((mood) => {
        const active = value === mood.id;
        return (
          <MoodChoice
            key={mood.id}
            active={active}
            label={mood.label}
            moodId={mood.id}
            onPress={() => {
              void Haptics.selectionAsync();
              onChange(mood.id);
            }}
          />
        );
      })}
    </View>
  );
}
