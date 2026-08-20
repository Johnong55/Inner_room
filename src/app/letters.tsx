import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Platform, Pressable, TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { Type } from "@/components/ui/Type";
import { palette } from "@/constants/theme";
import { createId, listLetters, saveLetter } from "@/database";
import { scheduleLetterNotification } from "@/services/notifications";
import type { Letter } from "@/types";

const options = [
  { label: "7 ngày", days: 7 },
  { label: "1 tháng", days: 30 },
  { label: "6 tháng", days: 180 },
];

export default function LettersScreen() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [body, setBody] = useState("");
  const [days, setDays] = useState(30);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [tomorrow] = useState(() => new Date(Date.now() + 86400000));
  useEffect(() => {
    void listLetters().then(setLetters);
  }, []);
  const create = async () => {
    const now = new Date();
    const deliverAt = customDate ?? new Date(now.getTime() + days * 86400000);
    const letter: Letter = {
      id: createId("letter"),
      body: body.trim(),
      createdAt: now.toISOString(),
      deliverAt: deliverAt.toISOString(),
      openedAt: null,
    };
    await saveLetter(letter);
    await scheduleLetterNotification(letter);
    setLetters((current) => [...current, letter]);
    setBody("");
  };
  return (
    <Screen>
      <PageHeader
        back
        title="Một lá thư cho mình"
        subtitle="InnerRoom sẽ giữ nguyên từng chữ. Không sửa, không diễn giải bằng AI."
      />
      <Card>
        <Type
          variant="eyebrow"
          className="mb-4"
          style={{ color: palette.ember }}
        >
          GỬI CHO MỘT NGÀY SAU NÀY
        </Type>
        <TextInput
          multiline
          value={body}
          onChangeText={setBody}
          placeholder="Có điều gì bạn muốn mình của ngày đó nhớ?"
          placeholderTextColor={palette.placeholder}
          textAlignVertical="top"
          className="min-h-[180px] rounded-[18px] bg-ink-soft px-4 py-4 font-sans text-[15px] leading-7 text-cream"
        />
        <View className="mt-4 flex-row flex-wrap gap-2">
          {options.map((option) => (
            <Pressable
              key={option.days}
              onPress={() => {
                setDays(option.days);
                setCustomDate(null);
              }}
              className="rounded-full border px-4 py-2"
              style={{
                borderColor:
                  !customDate && days === option.days
                    ? palette.moss
                    : palette.line,
                backgroundColor:
                  !customDate && days === option.days
                    ? palette.mossWash
                    : palette.inkSoft,
              }}
            >
              <Type variant="small">{option.label}</Type>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setShowPicker(true)}
            className="rounded-full border px-4 py-2"
            style={{ borderColor: customDate ? palette.moss : palette.line }}
          >
            <Type variant="small">Ngày khác</Type>
          </Pressable>
        </View>
        {showPicker ? (
          <DateTimePicker
            value={customDate ?? tomorrow}
            minimumDate={tomorrow}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(_, date) => {
              if (Platform.OS !== "ios") setShowPicker(false);
              if (date) setCustomDate(date);
            }}
          />
        ) : null}
        <Button
          className="mt-5"
          label="Gửi lá thư"
          disabled={!body.trim()}
          onPress={() => void create()}
        />
      </Card>
      <Type variant="eyebrow" muted className="mb-3 mt-9">
        NHỮNG LÁ THƯ ĐANG ĐỢI
      </Type>
      <View className="gap-3">
        {letters.length ? (
          letters.map((letter) => {
            const ready = new Date(letter.deliverAt) <= new Date();
            return (
              <Card key={letter.id}>
                <View>
                  <Type
                    variant="eyebrow"
                    style={{ color: ready ? palette.ember : palette.fogDim }}
                  >
                    {ready ? "ĐÃ ĐẾN NGÀY MỞ" : "ĐANG ĐƯỢC GIỮ KÍN"}
                  </Type>
                  <View className="mt-2">
                    <Type variant="heading">
                      {ready
                        ? "Có một lá thư dành cho bạn"
                        : `Mở vào ${new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(letter.deliverAt))}`}
                    </Type>
                    <Type variant="small" muted className="mt-1">
                      Viết ngày{" "}
                      {new Intl.DateTimeFormat("vi-VN").format(
                        new Date(letter.createdAt),
                      )}
                    </Type>
                  </View>
                </View>
                {ready ? (
                  <Type className="mt-5 leading-7">{letter.body}</Type>
                ) : null}
              </Card>
            );
          })
        ) : (
          <Type muted>
            Chưa có lá thư nào. Không cần viết nếu hôm nay bạn chưa muốn.
          </Type>
        )}
      </View>
    </Screen>
  );
}
