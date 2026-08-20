import type { ComponentProps } from "react";
import { ActivityIndicator, View } from "react-native";

import { palette } from "@/constants/theme";
import { PressableScale } from "./PressableScale";
import { Type } from "./Type";

type Props = Omit<ComponentProps<typeof PressableScale>, "children"> & {
  label: string;
  tone?: "primary" | "quiet" | "danger";
  loading?: boolean;
};

export function Button({
  label,
  tone = "primary",
  loading,
  disabled,
  ...props
}: Props) {
  const background =
    tone === "primary"
      ? palette.cream
      : tone === "danger"
        ? palette.dangerWash
        : palette.inkSoft;
  const color =
    tone === "primary"
      ? palette.ink
      : tone === "danger"
        ? palette.danger
        : palette.cream;
  return (
    <PressableScale disabled={disabled || loading} {...props}>
      <View
        className="min-h-[54px] items-center justify-center rounded-[16px] border px-6"
        style={{
          backgroundColor: background,
          borderColor: tone === "primary" ? palette.cream : palette.line,
          opacity: disabled ? 0.4 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color={color} />
        ) : (
          <Type variant="heading" style={{ color }}>
            {label}
          </Type>
        )}
      </View>
    </PressableScale>
  );
}
