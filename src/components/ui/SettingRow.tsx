import { Switch, View } from "react-native";

import { palette } from "@/constants/theme";
import { Type } from "./Type";

export function SettingRow({
  title,
  description,
  value,
  onValueChange,
  disabled,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View
      className="flex-row items-center border-b py-5 last:border-b-0"
      style={{ borderColor: palette.line, opacity: disabled ? 0.45 : 1 }}
    >
      <View className="flex-1 pr-3">
        <Type variant="heading">{title}</Type>
        <Type variant="small" muted className="mt-1">
          {description}
        </Type>
      </View>
      <Switch
        accessibilityLabel={title}
        disabled={disabled}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: palette.inkSoft, true: palette.mossDark }}
        thumbColor={value ? palette.cream : palette.fogDim}
      />
    </View>
  );
}
