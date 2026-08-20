import type { ComponentProps } from "react";
import { View } from "react-native";

import { palette } from "@/constants/theme";
import { Card } from "./Card";
import { PressableScale } from "./PressableScale";
import { Type } from "./Type";

type Props = Omit<ComponentProps<typeof PressableScale>, "children"> & {
  accent?: string;
  description: string;
  index?: string;
  kicker: string;
  title: string;
};

export function EditorialLink({
  accent: _accent = palette.moss,
  description,
  index,
  kicker,
  title,
  ...props
}: Props) {
  return (
    <PressableScale {...props}>
      <Card className="flex-row items-center px-5 py-4">
        <View className="flex-1 pr-4">
          <Type variant="eyebrow" style={{ color: palette.fogDim }}>
            {index ? `${index} · ` : ""}
            {kicker}
          </Type>
          <Type variant="heading" className="mt-1.5">
            {title}
          </Type>
          <Type variant="small" muted className="mt-1">
            {description}
          </Type>
        </View>
        <Type style={{ color: palette.creamMuted, fontSize: 22 }}>›</Type>
      </Card>
    </PressableScale>
  );
}
