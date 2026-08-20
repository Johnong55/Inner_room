import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useReducedMotion,
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

type MoodResponse = {
  message: string;
  activityOrder: ActivityId[];
};

const moodResponses: Record<MoodId, MoodResponse> = {
  peaceful: {
    message: "Cứ để sự bình yên này ở lại thêm một chút.",
    activityOrder: ["journal", "quiet", "conversation"],
  },
  okay: {
    message: "Ổn thôi cũng đã là một nơi đủ dịu để dừng lại.",
    activityOrder: ["journal", "conversation", "quiet"],
  },
  empty: {
    message: "Không cần phải lấp đầy khoảng trống ngay lúc này.",
    activityOrder: ["conversation", "quiet", "journal"],
  },
  sad: {
    message: "Nỗi buồn cũng có thể được đặt xuống thật nhẹ.",
    activityOrder: ["conversation", "journal", "quiet"],
  },
  tired: {
    message: "Bạn không cần cố thêm trong khoảnh khắc này.",
    activityOrder: ["quiet", "journal", "conversation"],
  },
  angry: {
    message: "Có lẽ cảm giác này đang bảo vệ một điều quan trọng.",
    activityOrder: ["untangle", "conversation", "quiet"],
  },
  anxious: {
    message: "Mình có thể đi chậm lại, chỉ trong một nhịp thở.",
    activityOrder: ["quiet", "untangle", "conversation"],
  },
  unsure: {
    message: "Không biết gọi tên thế nào cũng là một câu trả lời.",
    activityOrder: ["conversation", "journal", "quiet"],
  },
};

const activities: Record<ActivityId, MoodNextActivity> = {
  journal: {
    id: "journal",
    title: "Viết vài dòng",
    note: "Đặt điều đang ở trong đầu xuống trang giấy.",
    href: "/journal/editor",
  },
  conversation: {
    id: "conversation",
    title: "Trò chuyện với mình",
    note: "Hiểu rõ hơn cảm xúc vừa chọn.",
    href: "/(tabs)/room",
  },
  quiet: {
    id: "quiet",
    title: "Ngồi yên một chút",
    note: "Không cần kể gì, chỉ chậm lại một nhịp.",
    href: "/quiet",
  },
  untangle: {
    id: "untangle",
    title: "Gỡ một suy nghĩ",
    note: "Tách điều đang xảy ra khỏi điều mình lo.",
    href: "/untangle",
  },
};

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
  const reduceMotion = useReducedMotion();
  const [showActivities, setShowActivities] = useState(reduceMotion);
  const mood = moods.find((item) => item.id === moodId) ?? moods[0];
  const response = moodResponses[moodId];
  const suggestions = useMemo(
    () => response.activityOrder.slice(0, 3).map((id) => activities[id]),
    [response.activityOrder],
  );

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setTimeout(() => setShowActivities(true), 220);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      visible
    >
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

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={reduceMotion ? undefined : FadeIn.duration(180)}
            style={styles.moodSummary}
          >
            <MoodGlyph active moodId={mood.id} size={72} />
            <Type variant="eyebrow" muted style={styles.eyebrow}>
              MÌNH ĐANG Ở ĐÂY
            </Type>
            <Type variant="title" style={styles.moodTitle}>
              {mood.label}
            </Type>
            <Type muted style={styles.message}>
              {response.message}
            </Type>
          </Animated.View>

          {showActivities ? (
            <Animated.View
              entering={reduceMotion ? undefined : FadeInDown.duration(220)}
              style={styles.activities}
            >
              <Type variant="heading">Bạn muốn làm gì lúc này?</Type>
              <Type variant="small" muted style={styles.helper}>
                Chọn một việc phù hợp, hoặc đơn giản quay lại.
              </Type>

              <View style={styles.activityList}>
                {suggestions.map((activity, index) => (
                  <PressableScale
                    key={activity.id}
                    accessibilityLabel={`${activity.title}. ${activity.note}`}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      onChoose(activity);
                    }}
                    style={[
                      styles.activityRow,
                      index < suggestions.length - 1
                        ? styles.activityDivider
                        : null,
                    ]}
                  >
                    <View style={styles.activityCopy}>
                      <Type variant="heading" style={styles.activityTitle}>
                        {activity.title}
                      </Type>
                      <Type variant="small" muted style={styles.activityNote}>
                        {activity.note}
                      </Type>
                    </View>
                    <Type style={styles.arrow}>›</Type>
                  </PressableScale>
                ))}
              </View>

              <PressableScale onPress={onClose} style={styles.laterButton}>
                <Type variant="small" muted>
                  Chưa cần làm gì cả
                </Type>
              </PressableScale>
            </Animated.View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  activities: {
    width: "100%",
  },
  activityCopy: {
    flex: 1,
    paddingRight: 12,
  },
  activityDivider: {
    borderBottomColor: palette.line,
    borderBottomWidth: 1,
  },
  activityList: {
    backgroundColor: palette.inkRaised,
    borderColor: palette.line,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 16,
    overflow: "hidden",
  },
  activityNote: {
    marginTop: 1,
  },
  activityRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 76,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  activityTitle: {
    fontSize: 16,
    lineHeight: 23,
  },
  arrow: {
    color: palette.creamMuted,
    fontSize: 23,
  },
  closeButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  closeLabel: {
    color: palette.creamMuted,
    fontSize: 28,
    lineHeight: 30,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 28,
    paddingHorizontal: 22,
  },
  eyebrow: {
    marginTop: 14,
  },
  helper: {
    marginTop: 3,
  },
  laterButton: {
    alignItems: "center",
    minHeight: 48,
    paddingTop: 14,
  },
  message: {
    marginTop: 9,
    maxWidth: 320,
    textAlign: "center",
  },
  moodSummary: {
    alignItems: "center",
    paddingBottom: 40,
    paddingTop: 18,
  },
  moodTitle: {
    marginTop: 5,
    textAlign: "center",
  },
  safeArea: {
    backgroundColor: palette.ink,
    flex: 1,
  },
  topBar: {
    alignItems: "flex-end",
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
});
