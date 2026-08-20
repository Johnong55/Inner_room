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
      [palette.inkRaised, palette.mossWash],
    ),
    borderColor: interpolateColor(
      selected.value,
      [0, 1],
      [palette.line, palette.moss],
    ),
    transform: [{ scale: interpolate(selected.value, [0, 1], [1, 1.005]) }],
  }));

  const glyphStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(selected.value, [0, 1], [0, -1]) },
      { scale: interpolate(selected.value, [0, 1], [1, 1.05]) },
    ],
  }));

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className="w-[48%]"
    >
      <Animated.View
        className="min-h-[66px] flex-row items-center rounded-[20px] border px-4"
        style={cardStyle}
      >
        <Animated.View className="mr-3" style={glyphStyle}>
          <MoodGlyph active={active} moodId={moodId} />
        </Animated.View>
        <Type
          variant="small"
          style={{ color: active ? palette.cream : palette.creamMuted }}
        >
          {label}
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
    <View className="flex-row flex-wrap justify-between gap-y-3">
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
