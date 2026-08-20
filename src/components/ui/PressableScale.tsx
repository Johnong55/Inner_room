import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

type Props = ComponentProps<typeof Pressable> & { children: ReactNode };

export function PressableScale({
  children,
  onPressIn,
  onPressOut,
  style,
  ...props
}: Props) {
  const [pressed, setPressed] = useState(false);
  const resolvedStyle = StyleSheet.flatten(
    typeof style === "function" ? style({ pressed, hovered: false }) : style,
  );
  const baseTransform = Array.isArray(resolvedStyle?.transform)
    ? [...resolvedStyle.transform]
    : [];

  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={[
        resolvedStyle,
        {
          opacity: pressed ? 0.82 : resolvedStyle?.opacity,
          transform: [...baseTransform, { scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      {children}
    </Pressable>
  );
}
