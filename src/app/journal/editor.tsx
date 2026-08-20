import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Keyboard, Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { MoodPicker } from "@/components/mood/MoodPicker";
import { Button } from "@/components/ui/Button";
import { PressableScale } from "@/components/ui/PressableScale";
import { Type } from "@/components/ui/Type";
import { journalPrompts } from "@/constants/content";
import { palette } from "@/constants/theme";
import { createId, saveMoodCheckIn } from "@/database";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { useJournalStore } from "@/stores/useJournalStore";
import type { JournalEntry, MoodId } from "@/types";

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

export default function JournalEditorScreen() {
  const router = useRouter();
  const save = useJournalStore((state) => state.save);
  const [createdAt] = useState(() => new Date().toISOString());
  const [id] = useState(() => createId("journal"));
  const [body, setBody] = useState("");
  const [moodId, setMoodId] = useState<MoodId | null>(null);
  const [stage, setStage] = useState<"write" | "mood">("write");
  const [saved, setSaved] = useState(true);
  const [footerHeight, setFooterHeight] = useState(76);
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const footerBottom = keyboardHeight > 0 ? keyboardHeight + 8 : insets.bottom;
  const prompt = useMemo(
    () =>
      journalPrompts[
        Math.min(Math.floor(body.length / 140), journalPrompts.length - 1)
      ],
    [body.length],
  );

  useEffect(() => {
    if (!body.trim() || stage !== "write") return;
    const timer = setTimeout(() => {
      const entry: JournalEntry = {
        id,
        body: body.trimEnd(),
        moodId: null,
        isFavorite: false,
        createdAt,
        updatedAt: new Date().toISOString(),
      };
      void save(entry).then(() => setSaved(true));
    }, 650);
    return () => clearTimeout(timer);
  }, [body, createdAt, id, save, stage]);

  const saveEntry = async (selectedMood: MoodId | null) => {
    const entry: JournalEntry = {
      id,
      body: body.trimEnd(),
      moodId: selectedMood,
      isFavorite: false,
      createdAt,
      updatedAt: new Date().toISOString(),
    };
    await save(entry);
    setSaved(true);
  };

  const continueToMood = async () => {
    if (!body.trim()) return;
    Keyboard.dismiss();
    setSaved(false);
    await saveEntry(null);
    setStage("mood");
  };

  const finish = async (selectedMood: MoodId | null) => {
    await saveEntry(selectedMood);
    if (selectedMood) await saveMoodCheckIn(selectedMood);
    router.back();
  };

  if (stage === "mood") {
    return (
      <SafeAreaView className="flex-1 bg-ink">
        <View className="flex-row items-center justify-between px-5 pb-4 pt-3">
          <PressableScale
            accessibilityLabel="Quay lại bài viết"
            onPress={() => setStage("write")}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: palette.inkSoft }}
          >
            <ChevronLeft color={palette.cream} size={20} />
          </PressableScale>
          <View className="flex-row items-center gap-2">
            <View
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: palette.moss }}
            />
            <Type variant="small" muted>
              Bài viết đã được lưu
            </Type>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 28,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(650)}>
            <Type variant="eyebrow" style={{ color: palette.moss }}>
              MỘT LỜI CHECK-IN SAU KHI VIẾT
            </Type>
            <Type variant="title" className="mt-4">
              Cảm xúc nào ở lại rõ nhất hôm nay?
            </Type>
            <Type muted className="mb-9 mt-3">
              Chọn điều gần nhất với bạn. Không cần phải gọi tên thật chính xác.
            </Type>
            <MoodPicker value={moodId} onChange={setMoodId} />
          </Animated.View>
        </ScrollView>

        <View className="gap-2 px-5 pb-4">
          <Button
            disabled={!moodId}
            label="Lưu cảm xúc"
            onPress={() => void finish(moodId)}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => void finish(null)}
            className="items-center py-3"
          >
            <Type variant="small" muted>
              Bỏ qua cảm xúc lúc này
            </Type>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-ink">
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-5 pb-4 pt-3">
          <PressableScale
            accessibilityLabel="Đóng"
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: palette.inkSoft }}
          >
            <ChevronLeft color={palette.cream} size={20} />
          </PressableScale>
          <View className="flex-row items-center gap-2">
            {saved ? (
              <View
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: palette.moss }}
              />
            ) : null}
            <Type variant="small" muted>
              {saved ? "Đã lưu trên máy" : "Đang lưu…"}
            </Type>
          </View>
        </View>
        <View className="px-6">
          <Type variant="small" style={{ color: palette.moss }}>
            {formatDate(new Date(createdAt))}
          </Type>
          <Type variant="title" className="mt-5">
            Hôm nay đã có chuyện gì?
          </Type>
        </View>
        <TextInput
          autoFocus
          multiline
          value={body}
          onChangeText={(value) => {
            setBody(value);
            setSaved(false);
          }}
          textAlignVertical="top"
          placeholder="Bạn có thể bắt đầu từ bất cứ đâu…"
          placeholderTextColor={palette.placeholder}
          className="min-h-[260px] flex-1 px-6 pb-4 pt-6 font-sans text-[17px] leading-8 text-cream"
          style={{ paddingBottom: footerHeight + 20 }}
        />
        <View
          onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
          className="px-6 pb-4 pt-3"
          style={{
            backgroundColor: palette.ink,
            bottom: footerBottom,
            left: 0,
            position: "absolute",
            right: 0,
          }}
        >
          {body.length > 36 ? (
            <Animated.View
              entering={FadeIn.duration(700)}
              className="mb-4 rounded-[20px] border p-4"
              style={{
                borderColor: palette.line,
                backgroundColor: palette.inkRaised,
              }}
            >
              <Type
                variant="eyebrow"
                className="mb-2"
                style={{ color: palette.moss }}
              >
                GỢI Ý, NẾU BẠN MUỐN
              </Type>
              <Pressable
                onPress={() => setBody((value) => `${value}\n\n${prompt}\n`)}
              >
                <Type>{prompt}</Type>
              </Pressable>
            </Animated.View>
          ) : null}
          <Button
            disabled={!body.trim()}
            label="Lưu và chọn cảm xúc"
            onPress={() => void continueToMood()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
