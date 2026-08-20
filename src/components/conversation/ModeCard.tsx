import { useRouter } from "expo-router";

import { EditorialLink } from "@/components/ui/EditorialLink";
import { palette } from "@/constants/theme";
import type { ConversationMode } from "@/types";

export function ModeCard({
  mode,
  index,
}: {
  mode: ConversationMode;
  index: number;
}) {
  const router = useRouter();
  return (
    <EditorialLink
      accent={palette.moss}
      description={mode.description}
      index={String(index + 1).padStart(2, "0")}
      kicker="CÁCH TRÒ CHUYỆN"
      onPress={() =>
        router.push({ pathname: "/conversation", params: { mode: mode.id } })
      }
      title={mode.title}
    />
  );
}
