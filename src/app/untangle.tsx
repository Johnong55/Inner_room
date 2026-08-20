import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { Type } from "@/components/ui/Type";
import { palette } from "@/constants/theme";
import { saveThoughtRecord } from "@/database";

const fields = [
  {
    key: "thought",
    title: "Điều tôi đang nghĩ",
    prompt: "Ví dụ: Tôi nghĩ mình không đủ giỏi.",
  },
  {
    key: "facts",
    title: "Sự thật tôi biết",
    prompt: "Chỉ những gì đã thật sự xảy ra hoặc có thể kiểm chứng.",
  },
  {
    key: "assumptions",
    title: "Điều tôi đang suy đoán",
    prompt: "Những ý nghĩa, kết luận hoặc tương lai mà mình đang hình dung.",
  },
  {
    key: "action",
    title: "Điều tôi có thể làm",
    prompt: "Một việc nhỏ và thực tế — không cần giải quyết tất cả.",
  },
] as const;

export default function UntangleScreen() {
  const router = useRouter();
  const [values, setValues] = useState({
    thought: "",
    facts: "",
    assumptions: "",
    action: "",
  });
  const [saved, setSaved] = useState(false);
  const save = async () => {
    await saveThoughtRecord(values);
    setSaved(true);
    setTimeout(() => router.back(), 500);
  };
  return (
    <Screen>
      <PageHeader
        back
        title="Gỡ một suy nghĩ"
        subtitle="Không phủ nhận cảm xúc. Chỉ đặt sự thật và nỗi sợ ở những chỗ khác nhau."
      />
      <View className="gap-4">
        {fields.map((field, index) => (
          <Card key={field.key}>
            <View className="mb-3 flex-row items-center">
              <View
                className="mr-3 h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: palette.inkSoft }}
              >
                <Type variant="small" style={{ color: palette.moss }}>
                  {index + 1}
                </Type>
              </View>
              <Type variant="heading">{field.title}</Type>
            </View>
            <TextInput
              multiline
              value={values[field.key]}
              onChangeText={(text) =>
                setValues((current) => ({ ...current, [field.key]: text }))
              }
              placeholder={field.prompt}
              placeholderTextColor={palette.placeholder}
              textAlignVertical="top"
              className="min-h-[92px] rounded-[16px] bg-ink-soft px-4 py-3 font-sans text-[15px] leading-6 text-cream"
            />
          </Card>
        ))}
      </View>
      <Button
        className="mt-6"
        label={saved ? "Đã lưu trên thiết bị" : "Giữ lại điều này"}
        disabled={!values.thought.trim()}
        onPress={() => void save()}
      />
    </Screen>
  );
}
