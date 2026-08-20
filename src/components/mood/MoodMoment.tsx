import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { moods } from "@/constants/content";
import { palette } from "@/constants/theme";
import type { MoodId } from "@/types";
import { PressableScale } from "../ui/PressableScale";
import { Type } from "../ui/Type";
import { MoodGlyph } from "./MoodGlyph";

type ActivityId = "journal" | "conversation" | "quiet" | "untangle";

export type MoodNextActivity = {
  id: ActivityId;
  title: string;
  note: string;
  href: Href;
};

type MoodVisual = {
  accent: string;
  glow: string;
  message: string;
  activityOrder: ActivityId[];
};

const moodVisuals: Record<MoodId, MoodVisual> = {
  peaceful: {
    accent: "#9eb8a7",
    glow: "#5f8a78",
    message: "Cứ để sự bình yên này ở lại thêm một chút.",
    activityOrder: ["journal", "quiet", "conversation"],
  },
  okay: {
    accent: "#adc0a7",
    glow: "#718d73",
    message: "Ổn thôi cũng đã là một nơi đủ dịu để dừng lại.",
    activityOrder: ["journal", "conversation", "quiet"],
  },
  empty: {
    accent: "#9aa8aa",
    glow: "#657a80",
    message: "Không cần phải lấp đầy khoảng trống ngay lúc này.",
    activityOrder: ["conversation", "quiet", "journal"],
  },
  sad: {
    accent: "#91a8be",
    glow: "#587694",
    message: "Nỗi buồn cũng có thể được đặt xuống thật nhẹ.",
    activityOrder: ["conversation", "journal", "quiet"],
  },
  tired: {
    accent: "#b9a78f",
    glow: "#826f59",
    message: "Bạn không cần cố thêm trong khoảnh khắc này.",
    activityOrder: ["quiet", "journal", "conversation"],
  },
  angry: {
    accent: "#c49a82",
    glow: "#925f4c",
    message: "Có lẽ cảm giác này đang bảo vệ một điều quan trọng.",
    activityOrder: ["untangle", "conversation", "quiet"],
  },
  anxious: {
    accent: "#99a9c2",
    glow: "#65799d",
    message: "Mình có thể đi chậm lại, chỉ trong một nhịp thở.",
    activityOrder: ["quiet", "untangle", "conversation"],
  },
  unsure: {
    accent: "#94a3aa",
    glow: "#61737c",
    message: "Không biết gọi tên thế nào cũng là một câu trả lời.",
    activityOrder: ["conversation", "journal", "quiet"],
  },
};

const activities: Record<ActivityId, MoodNextActivity> = {
  journal: {
    id: "journal",
    title: "Viết vài dòng",
    note: "Một vài dòng thôi, không cần trọn vẹn.",
    href: "/journal/editor",
  },
  conversation: {
    id: "conversation",
    title: "Trò chuyện tiếp",
    note: "Để cảm xúc này được lắng nghe thêm.",
    href: "/(tabs)/room",
  },
  quiet: {
    id: "quiet",
    title: "Mở không gian yên tĩnh",
    note: "Không cần kể gì. Chỉ cần một nhịp thở.",
    href: "/quiet",
  },
  untangle: {
    id: "untangle",
    title: "Gỡ một suy nghĩ",
    note: "Tách nhẹ điều đang xảy ra khỏi điều mình lo.",
    href: "/untangle",
  },
};

const particles = [
  {
    x: 0.12,
    y: 0.2,
    size: 3,
    distance: 54,
    drift: 14,
    duration: 4200,
    delay: 100,
  },
  {
    x: 0.82,
    y: 0.17,
    size: 2,
    distance: 42,
    drift: -12,
    duration: 5100,
    delay: 700,
  },
  {
    x: 0.22,
    y: 0.44,
    size: 2,
    distance: 48,
    drift: -8,
    duration: 4700,
    delay: 1200,
  },
  {
    x: 0.72,
    y: 0.4,
    size: 4,
    distance: 62,
    drift: 10,
    duration: 5600,
    delay: 300,
  },
  {
    x: 0.08,
    y: 0.7,
    size: 2,
    distance: 44,
    drift: 12,
    duration: 4500,
    delay: 1700,
  },
  {
    x: 0.9,
    y: 0.66,
    size: 3,
    distance: 58,
    drift: -14,
    duration: 5300,
    delay: 950,
  },
  {
    x: 0.32,
    y: 0.8,
    size: 2,
    distance: 38,
    drift: 8,
    duration: 4900,
    delay: 2100,
  },
  {
    x: 0.68,
    y: 0.83,
    size: 2,
    distance: 46,
    drift: -7,
    duration: 4400,
    delay: 1450,
  },
];

function FloatingParticle({
  particle,
  color,
  width,
  height,
  reduceMotion,
}: {
  particle: (typeof particles)[number];
  color: string;
  width: number;
  height: number;
  reduceMotion: boolean;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 0.45;
      return;
    }

    progress.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(1, {
          duration: particle.duration,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        false,
      ),
    );

    return () => cancelAnimation(progress);
  }, [particle.delay, particle.duration, progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.18, 0.75, 1], [0, 0.7, 0.35, 0]),
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 0.5, 1],
          [0, particle.drift, 0],
        ),
      },
      { translateY: -particle.distance * progress.value },
      { scale: interpolate(progress.value, [0, 0.3, 1], [0.6, 1, 0.7]) },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          backgroundColor: color,
          height: particle.size,
          left: width * particle.x,
          top: height * particle.y,
          width: particle.size,
        },
        animatedStyle,
      ]}
    />
  );
}

export function MoodMoment({
  moodId,
  visible,
  onClose,
  onChoose,
}: {
  moodId: MoodId | null;
  visible: boolean;
  onClose: () => void;
  onChoose: (activity: MoodNextActivity) => void;
}) {
  const mood = moods.find((item) => item.id === moodId);
  if (!visible || !mood) return null;

  return (
    <MoodMomentContent
      key={mood.id}
      moodId={mood.id}
      onChoose={onChoose}
      onClose={onClose}
    />
  );
}

function MoodMomentContent({
  moodId,
  onClose,
  onChoose,
}: {
  moodId: MoodId;
  onClose: () => void;
  onChoose: (activity: MoodNextActivity) => void;
}) {
  const { width, height } = useWindowDimensions();
  const compact = height < 740;
  const reduceMotion = useReducedMotion();
  const [showActivities, setShowActivities] = useState(false);
  const pulse = useSharedValue(0);
  const reveal = useSharedValue(0);
  const mood = moods.find((item) => item.id === moodId) ?? moods[0];
  const visual = moodVisuals[moodId];
  const suggestions = useMemo(
    () => visual.activityOrder.slice(0, 3).map((id) => activities[id]),
    [visual.activityOrder],
  );

  useEffect(() => {
    reveal.value = reduceMotion
      ? 1
      : withSpring(1, { damping: 16, stiffness: 95 });
    pulse.value = reduceMotion
      ? 0.45
      : withRepeat(
          withSequence(
            withTiming(1, {
              duration: 1500,
              easing: Easing.inOut(Easing.quad),
            }),
            withTiming(0, {
              duration: 1500,
              easing: Easing.inOut(Easing.quad),
            }),
          ),
          -1,
          false,
        );

    const timer = setTimeout(
      () => setShowActivities(true),
      reduceMotion ? 120 : 850,
    );
    return () => {
      clearTimeout(timer);
      cancelAnimation(pulse);
    };
  }, [pulse, reduceMotion, reveal]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.12, 0.25]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.9, 1.08]) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0, 1], [0, 0.42]),
    transform: [
      { scale: interpolate(reveal.value, [0, 1], [0.5, 1]) },
      { rotate: `${interpolate(pulse.value, [0, 1], [-2, 2])}deg` },
    ],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [
      { translateY: interpolate(reveal.value, [0, 1], [18, 0]) },
      {
        scale:
          interpolate(reveal.value, [0, 1], [0.72, 1]) *
          interpolate(pulse.value, [0, 1], [1, 1.035]),
      },
    ],
  }));

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[palette.ink, `${visual.glow}30`, palette.ink]}
          locations={[0, 0.46, 1]}
          style={StyleSheet.absoluteFill}
        />
        {particles.map((particle, index) => (
          <FloatingParticle
            key={`${mood.id}-${index}`}
            color={visual.accent}
            height={height}
            particle={particle}
            reduceMotion={reduceMotion}
            width={width}
          />
        ))}

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBar}>
            <PressableScale
              accessibilityLabel="Đóng"
              hitSlop={12}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Type style={styles.closeLabel}>×</Type>
            </PressableScale>
          </View>

          <View style={[styles.moment, compact && styles.momentCompact]}>
            <View style={[styles.orb, compact && styles.orbCompact]}>
              <Animated.View
                style={[
                  styles.glow,
                  { backgroundColor: visual.glow },
                  glowStyle,
                ]}
              />
              <Animated.View
                style={[
                  styles.ring,
                  { borderColor: `${visual.accent}78` },
                  ringStyle,
                ]}
              />
              <Animated.View style={emojiStyle}>
                <MoodGlyph active moodId={mood.id} size={64} />
              </Animated.View>
            </View>

            <Animated.View
              entering={
                reduceMotion ? undefined : FadeIn.duration(700).delay(180)
              }
              style={[styles.copy, compact && styles.copyCompact]}
            >
              <Type variant="eyebrow" style={{ color: visual.accent }}>
                MÌNH ĐANG Ở ĐÂY
              </Type>
              <Type variant="title" style={styles.moodTitle}>
                {mood.label}
              </Type>
              <Type muted style={styles.message}>
                {visual.message}
              </Type>
            </Animated.View>
          </View>

          <View
            style={[styles.activityArea, compact && styles.activityAreaCompact]}
          >
            {showActivities ? (
              <Animated.View
                entering={
                  reduceMotion
                    ? undefined
                    : FadeInDown.duration(650).springify().damping(19)
                }
                style={[
                  styles.activityPanel,
                  compact && styles.activityPanelCompact,
                  {
                    backgroundColor: `${visual.glow}16`,
                    borderColor: `${visual.accent}24`,
                  },
                ]}
              >
                <Type variant="heading" style={styles.activityHeading}>
                  Bạn muốn mình làm gì lúc này?
                </Type>
                <Type variant="small" muted style={styles.activityHelper}>
                  Chạm vào một lựa chọn bên dưới. Không có gì là bắt buộc.
                </Type>
                <View style={styles.activityList}>
                  {suggestions.map((activity, index) => {
                    return (
                      <View key={activity.id} style={styles.activityItem}>
                        <PressableScale
                          accessibilityLabel={`${activity.title}. ${activity.note}`}
                          accessibilityHint="Chạm hai lần để mở"
                          android_ripple={{ color: `${visual.accent}20` }}
                          onPress={() => {
                            void Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Soft,
                            );
                            onChoose(activity);
                          }}
                          style={[
                            styles.activityCard,
                            {
                              borderColor:
                                index === 0
                                  ? `${visual.accent}72`
                                  : `${visual.accent}32`,
                              backgroundColor:
                                index === 0
                                  ? `${visual.glow}30`
                                  : palette.cardGlass,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.activityIndex,
                              {
                                backgroundColor: `${visual.glow}28`,
                                borderColor: `${visual.accent}38`,
                              },
                            ]}
                          >
                            <Type
                              variant="eyebrow"
                              style={{ color: visual.accent }}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </Type>
                          </View>
                          <View style={styles.activityCopy}>
                            {index === 0 ? (
                              <Type
                                variant="eyebrow"
                                style={[
                                  styles.suggestionLabel,
                                  { color: visual.accent },
                                ]}
                              >
                                GỢI Ý NHẸ
                              </Type>
                            ) : null}
                            <Type variant="heading">{activity.title}</Type>
                            <Type
                              variant="small"
                              muted
                              style={styles.activityNote}
                            >
                              {activity.note}
                            </Type>
                          </View>
                          <Type
                            variant="eyebrow"
                            style={[
                              styles.activityOpen,
                              { color: visual.accent },
                            ]}
                          >
                            MỞ
                          </Type>
                        </PressableScale>
                      </View>
                    );
                  })}
                </View>
                <PressableScale
                  accessibilityHint="Đóng các lựa chọn và quay lại"
                  accessibilityLabel="Chưa cần, quay lại"
                  onPress={onClose}
                  style={styles.laterButton}
                >
                  <Type variant="small" style={styles.laterLabel}>
                    Chưa cần, quay lại
                  </Type>
                </PressableScale>
              </Animated.View>
            ) : (
              <View style={styles.activityPlaceholder} />
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.ink,
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    alignItems: "flex-end",
    height: 48,
    justifyContent: "center",
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: palette.creamWash,
    borderColor: palette.line,
    borderRadius: 22,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  closeLabel: {
    color: palette.creamMuted,
    fontSize: 28,
    lineHeight: 30,
    marginTop: -2,
  },
  moment: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 285,
    paddingBottom: 10,
  },
  momentCompact: {
    minHeight: 225,
    paddingBottom: 2,
  },
  orb: {
    alignItems: "center",
    height: 148,
    justifyContent: "center",
    width: 148,
  },
  orbCompact: {
    height: 128,
    transform: [{ scale: 0.86 }],
    width: 148,
  },
  glow: {
    borderRadius: 90,
    height: 148,
    position: "absolute",
    width: 148,
  },
  ring: {
    borderRadius: 56,
    borderWidth: 1,
    height: 112,
    position: "absolute",
    width: 112,
  },
  copy: {
    alignItems: "center",
    marginTop: 8,
    maxWidth: 330,
  },
  copyCompact: {
    marginTop: -2,
  },
  moodTitle: {
    fontSize: 36,
    lineHeight: 40,
    marginTop: 6,
    textAlign: "center",
  },
  message: {
    lineHeight: 23,
    marginTop: 10,
    textAlign: "center",
  },
  activityArea: {
    justifyContent: "flex-end",
    minHeight: 390,
    paddingBottom: 6,
    width: "100%",
  },
  activityAreaCompact: {
    minHeight: 354,
  },
  activityHeading: {
    textAlign: "left",
  },
  activityHelper: {
    marginBottom: 15,
    marginTop: 3,
    textAlign: "left",
  },
  activityPanel: {
    alignSelf: "stretch",
    borderRadius: 28,
    borderWidth: 1,
    padding: 16,
    width: "100%",
  },
  activityPanelCompact: {
    borderRadius: 24,
    padding: 13,
  },
  activityList: {
    gap: 10,
    width: "100%",
  },
  activityItem: {
    alignSelf: "stretch",
    width: "100%",
  },
  activityCard: {
    alignItems: "center",
    backgroundColor: palette.cardGlass,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 76,
    overflow: "hidden",
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: "100%",
  },
  activityIndex: {
    alignItems: "center",
    borderRadius: 13,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  activityCopy: {
    flex: 1,
    marginLeft: 14,
  },
  suggestionLabel: {
    fontSize: 9,
    lineHeight: 13,
    marginBottom: 1,
  },
  activityNote: {
    marginTop: 1,
  },
  activityOpen: {
    fontSize: 9,
    marginLeft: 8,
  },
  laterButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: palette.creamWashSoft,
    borderColor: palette.line,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 46,
    width: "100%",
  },
  laterLabel: {
    color: palette.creamMuted,
  },
  activityPlaceholder: {
    height: 300,
  },
  particle: {
    borderRadius: 999,
    position: "absolute",
  },
});
