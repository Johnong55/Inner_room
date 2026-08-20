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
        title="Một cuộc trò chuyện với chính mình"
        subtitle="Không phải một người lạ cho lời khuyên. Chỉ là một tấm gương giúp bạn nghe rõ hơn."
      />
      <View
        className="mb-6 rounded-[18px] border px-4 py-3"
        style={{
          borderColor: palette.line,
          backgroundColor: palette.inkRaised,
        }}
      >
        <Type variant="eyebrow" style={{ color: palette.moss }}>
          KÝ ỨC · {memoryEnabled ? "ĐANG BẬT" : "ĐANG TẮT"}
        </Type>
        <Type variant="small" muted className="mt-1.5">
          Chỉ thay đổi khi chính bạn chọn trong mục Của bạn.
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
          accent={palette.rain}
          description="Tách sự thật khỏi điều mình đang suy đoán."
          kicker="VIẾT ĐỂ NHÌN RÕ"
          onPress={() => router.push("/untangle")}
          title="Gỡ một suy nghĩ"
        />
        <EditorialLink
          accent={palette.ember}
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
