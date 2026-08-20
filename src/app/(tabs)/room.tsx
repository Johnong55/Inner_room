import { useRouter } from "expo-router";
import { View } from "react-native";

import { ModeCard } from "@/components/conversation/ModeCard";
import { EditorialLink } from "@/components/ui/EditorialLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { Type } from "@/components/ui/Type";
import { conversationModes } from "@/constants/content";
import { palette } from "@/constants/theme";
import { usePreferencesStore } from "@/stores/usePreferencesStore";

export default function RoomScreen() {
  const router = useRouter();
  const memoryEnabled = usePreferencesStore((state) => state.memoryEnabled);
  return (
    <Screen>
      <PageHeader
        title="Trò chuyện"
        subtitle="Chọn cách bạn muốn được lắng nghe lúc này."
      />
      <View
        className="mb-6 flex-row items-center justify-between border-b pb-4"
        style={{
          borderColor: palette.line,
        }}
      >
        <View className="flex-1 pr-4">
          <Type variant="small">Ký ức từ nhật ký</Type>
          <Type variant="small" muted>
            Có thể thay đổi trong mục Của bạn
          </Type>
        </View>
        <Type variant="small" muted>
          {memoryEnabled ? "Đang bật" : "Đang tắt"}
        </Type>
      </View>
      <View className="gap-3">
        {conversationModes.map((mode, index) => (
          <ModeCard key={mode.id} mode={mode} index={index} />
        ))}
      </View>
      <Type variant="eyebrow" muted className="mb-3 mt-9">
        NHỮNG CÁCH KHÁC ĐỂ BẮT ĐẦU
      </Type>
      <View className="gap-3">
        <EditorialLink
          description="Tách sự thật khỏi điều mình đang suy đoán."
          kicker="VIẾT ĐỂ NHÌN RÕ"
          onPress={() => router.push("/untangle")}
          title="Gỡ một suy nghĩ"
        />
        <EditorialLink
          description="Chỉ nhẹ đi 1%, không cần giải quyết tất cả."
          kicker="MỘT BƯỚC NHỎ"
          onPress={() =>
            router.push({
              pathname: "/conversation",
              params: { mode: "untangle", intent: "next-step" },
            })
          }
          title="Một việc thôi"
        />
      </View>
    </Screen>
  );
}
