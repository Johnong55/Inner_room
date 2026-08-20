import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { TextInput, View } from "react-native";

import { EntryCard } from "@/components/journal/EntryCard";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { Type } from "@/components/ui/Type";
import { palette } from "@/constants/theme";
import { searchOwnLife } from "@/services/ai/semanticSearch";
import { useJournalStore } from "@/stores/useJournalStore";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import type { JournalEntry } from "@/types";

export default function JournalScreen() {
  const router = useRouter();
  const entries = useJournalStore((state) => state.entries);
  const load = useJournalStore((state) => state.load);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JournalEntry[] | null>(null);
  const [semantic, setSemantic] = useState(false);
  const memoryEnabled = usePreferencesStore((state) => state.memoryEnabled);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const search = async () => {
    if (!query.trim()) {
      setResults(null);
      setSemantic(false);
      return;
    }
    const result = await searchOwnLife(query.trim(), memoryEnabled);
    setResults(result.entries);
    setSemantic(result.semantic);
  };
  const shown = results ?? entries;

  return (
    <Screen>
      <PageHeader
        title="Nhật ký"
        subtitle="Những điều bạn đã đặt xuống ở đây vẫn thuộc về bạn."
      />
      <View
        className="mb-5 flex-row items-center rounded-[20px] border px-4"
        style={{
          backgroundColor: palette.inkRaised,
          borderColor: palette.line,
        }}
      >
        <Type variant="eyebrow" style={{ color: palette.moss }}>
          TÌM
        </Type>
        <TextInput
          value={query}
          onChangeText={(value) => {
            setQuery(value);
            if (!value) setResults(null);
          }}
          onSubmitEditing={() => void search()}
          placeholder="Tìm trong những ngày đã qua…"
          placeholderTextColor={palette.placeholder}
          returnKeyType="search"
          className="h-14 flex-1 px-3 font-sans text-[14px] text-cream"
        />
      </View>
      {results ? (
        <Type variant="small" muted className="mb-4">
          {semantic
            ? "Tìm theo ý nghĩa · Kết quả luôn mở về trang viết gốc."
            : "Tìm riêng tư trên thiết bị · Bật ký ức AI trong You để tìm theo ý nghĩa."}
        </Type>
      ) : null}
      <Button
        label="Viết về hôm nay"
        onPress={() => router.push("/journal/editor")}
      />
      <View className="mt-7 gap-3">
        {shown.length ? (
          shown.map((entry) => <EntryCard key={entry.id} entry={entry} />)
        ) : (
          <View className="items-center px-7 py-16">
            <View
              className="h-[2px] w-10 rounded-full"
              style={{ backgroundColor: palette.moss }}
            />
            <Type variant="heading" className="mt-5 text-center">
              {results
                ? "Chưa tìm thấy ký ức phù hợp"
                : "Trang đầu tiên vẫn đang chờ bạn"}
            </Type>
            <Type muted className="mt-2 text-center">
              {results
                ? "Thử một vài từ gần với điều bạn nhớ."
                : "Không cần viết hay. Một câu thật lòng là đủ."}
            </Type>
          </View>
        )}
      </View>
    </Screen>
  );
}
