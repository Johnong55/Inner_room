import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { Type } from "@/components/ui/Type";
import { moods } from "@/constants/content";
import { getJournal } from "@/database";
import { useJournalStore } from "@/stores/useJournalStore";
import type { JournalEntry } from "@/types";

export default function JournalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const remove = useJournalStore((state) => state.remove);
  const save = useJournalStore((state) => state.save);
  useEffect(() => {
    void getJournal(id).then(setEntry);
  }, [id]);
  if (!entry)
    return (
      <Screen>
        <PageHeader back title="Một ngày đã qua" />
      </Screen>
    );
  const mood = moods.find((item) => item.id === entry.moodId);
  const date = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(entry.createdAt));

  return (
    <Screen>
      <PageHeader
        back
        title={date}
        subtitle={mood ? mood.label : "Hôm đó bạn không chọn một cảm xúc."}
      />
      <Type className="text-[17px] leading-8">{entry.body}</Type>
      <View className="mt-12 gap-3">
        <Button
          tone="quiet"
          label={
            entry.isFavorite
              ? "Đã giữ lại câu chuyện này"
              : "Giữ lại câu chuyện này"
          }
          onPress={() => {
            const next = {
              ...entry,
              isFavorite: !entry.isFavorite,
              updatedAt: new Date().toISOString(),
            };
            setEntry(next);
            void save(next);
          }}
        />
        <Button
          tone="danger"
          label="Xóa trang này"
          onPress={() =>
            Alert.alert("Xóa trang này?", "Nội dung sẽ bị xóa khỏi thiết bị.", [
              { text: "Giữ lại", style: "cancel" },
              {
                text: "Xóa",
                style: "destructive",
                onPress: () => void remove(entry.id).then(() => router.back()),
              },
            ])
          }
        />
      </View>
      <View className="mt-5 items-center justify-center">
        <Type variant="small" muted>
          Không có ngày nào bị chấm điểm ở đây.
        </Type>
      </View>
    </Screen>
  );
}
