import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import {
  MoodMoment,
  type MoodNextActivity,
} from "@/components/mood/MoodMoment";
import { MoodPicker } from "@/components/mood/MoodPicker";
import { Button } from "@/components/ui/Button";
import { EditorialLink } from "@/components/ui/EditorialLink";
import { Screen } from "@/components/ui/Screen";
import { Type } from "@/components/ui/Type";
import { saveMoodCheckIn } from "@/database";
import type { MoodId } from "@/types";

const actions = [
  {
    kicker: "TRÒ CHUYỆN",
    title: "Nói với chính mình",
    note: "Để hiểu rõ hơn điều đang ở trong đầu",
    href: "/(tabs)/room" as const,
  },
  {
    kicker: "YÊN TĨNH",
    title: "Ngồi yên một chút",
    note: "Không cần viết, không cần tìm câu trả lời",
    href: "/quiet" as const,
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
      <View className="pb-7 pt-8">
        <Type variant="display">{greeting()}</Type>
        <Type muted className="mt-2">
          Hôm nay trong lòng bạn thế nào?
        </Type>
      </View>
      <MoodPicker value={mood} onChange={chooseMood} />
      <View className="mt-8">
        <Type variant="eyebrow" muted className="mb-3">
          BẮT ĐẦU TỪ MỘT VIỆC
        </Type>
        <Button
          label="Viết về hôm nay"
          onPress={() => router.push("/journal/editor")}
        />
        <View className="mt-3 gap-2">
          {actions.map((action) => (
            <EditorialLink
              key={action.title}
              description={action.note}
              kicker={action.kicker}
              onPress={() => router.push(action.href)}
              title={action.title}
            />
          ))}
        </View>
      </View>
      <Type muted className="px-8 pt-9 text-center italic">
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
