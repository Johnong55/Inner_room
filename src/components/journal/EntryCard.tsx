import { useRouter } from "expo-router";
import { View } from "react-native";

import { moods } from "@/constants/content";
import { palette } from "@/constants/theme";
import type { JournalEntry } from "@/types";
import { MoodGlyph } from "../mood/MoodGlyph";
import { Card } from "../ui/Card";
import { PressableScale } from "../ui/PressableScale";
import { Type } from "../ui/Type";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(value));

export function EntryCard({ entry }: { entry: JournalEntry }) {
  const router = useRouter();
  const mood = moods.find((item) => item.id === entry.moodId);
  return (
    <PressableScale
      onPress={() =>
        router.push({ pathname: "/journal/[id]", params: { id: entry.id } })
      }
    >
      <Card className="flex-row items-center">
        <View
          className="mr-4 h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: palette.inkSoft }}
        >
          {mood ? (
            <MoodGlyph moodId={mood.id} size={32} />
          ) : (
            <Type muted>—</Type>
          )}
        </View>
        <View className="flex-1">
          <Type variant="small" style={{ color: palette.moss }}>
            {formatDate(entry.createdAt)}
          </Type>
          <Type numberOfLines={2} className="mt-2">
            {entry.body}
          </Type>
        </View>
        <Type variant="eyebrow" style={{ color: palette.fogDim }}>
          ĐỌC LẠI
        </Type>
      </Card>
    </PressableScale>
  );
}
