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
  accent = palette.moss,
  description,
  index,
  kicker,
  title,
  ...props
}: Props) {
  return (
    <PressableScale {...props}>
      <Card className="overflow-hidden px-5 py-5">
        <View
          className="absolute bottom-5 left-0 top-5 w-[2px] rounded-full"
          style={{ backgroundColor: accent, opacity: 0.72 }}
        />
        <View className="flex-row items-center justify-between">
          <Type variant="eyebrow" style={{ color: accent }}>
            {index ? `${index} · ` : ""}
            {kicker}
          </Type>
          <Type variant="eyebrow" style={{ color: palette.fogDim }}>
            MỞ
          </Type>
        </View>
        <Type variant="heading" className="mt-3 pr-4 text-[20px]">
          {title}
        </Type>
        <Type variant="small" muted className="mt-1.5 pr-5">
          {description}
        </Type>
      </Card>
    </PressableScale>
  );
}
