import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import {
  MoodMoment,
  type MoodNextActivity,
} from "@/components/mood/MoodMoment";
import { MoodPicker } from "@/components/mood/MoodPicker";
import { EditorialLink } from "@/components/ui/EditorialLink";
import { Screen } from "@/components/ui/Screen";
import { Type } from "@/components/ui/Type";
import { palette } from "@/constants/theme";
import { saveMoodCheckIn } from "@/database";
import type { MoodId } from "@/types";

const actions = [
  {
    kicker: "NHẬT KÝ",
    title: "Viết về hôm nay",
    note: "Đặt những điều đang nặng xuống đây",
    href: "/journal/editor" as const,
    color: palette.ember,
  },
  {
    kicker: "PHẢN CHIẾU",
    title: "Nói chuyện với chính mình",
    note: "Một tấm gương cho những điều khó gọi tên",
    href: "/(tabs)/room" as const,
    color: palette.moss,
  },
  {
    kicker: "KHOẢNG LẶNG",
    title: "Ngồi yên một chút",
    note: "Chỉ mưa, gió và một nhịp thở chậm",
    href: "/quiet" as const,
    color: palette.rain,
  },
  {
    kicker: "HÀNH TRÌNH",
    title: "Những ngày đã qua",
    note: "Nhìn lại mà không chấm điểm",
    href: "/(tabs)/journey" as const,
    color: palette.creamMuted,
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Chào buổi sáng.";
  if (hour < 18) return "Chào buổi chiều.";
  return "Chào buổi tối.";
}

export default function TodayScreen() {
  const router = useRouter();
  const [mood, setMood] = useState<MoodId | null>(null);
  const [momentMood, setMomentMood] = useState<MoodId | null>(null);
  const chooseMood = (next: MoodId) => {
    setMood(next);
    setMomentMood(next);
    void saveMoodCheckIn(next);
  };

  const chooseActivity = (activity: MoodNextActivity) => {
    setMomentMood(null);
    router.push(activity.href);
  };

  return (
    <Screen>
      <View className="pb-8 pt-10">
        <Type variant="display">{greeting()}</Type>
        <Type muted className="mt-2">
          Hôm nay trong lòng bạn thế nào?
        </Type>
      </View>
      <MoodPicker value={mood} onChange={chooseMood} />
      <View className="mt-9 gap-3">
        {actions.map((action, index) => {
          return (
            <Animated.View
              key={action.title}
              entering={FadeInDown.delay(90 * index).duration(650)}
            >
              <EditorialLink
                accent={action.color}
                description={action.note}
                index={String(index + 1).padStart(2, "0")}
                kicker={action.kicker}
                onPress={() => router.push(action.href)}
                title={action.title}
              />
            </Animated.View>
          );
        })}
      </View>
      <Type muted className="px-8 pt-11 text-center italic">
        “Không phải ngày nào cũng cần có câu trả lời.”
      </Type>
      <MoodMoment
        moodId={momentMood}
        onChoose={chooseActivity}
        onClose={() => setMomentMood(null)}
        visible={momentMood !== null}
      />
    </Screen>
  );
}
