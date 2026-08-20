import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

type Props = ComponentProps<typeof Pressable> & { children: ReactNode };

export function PressableScale({
  children,
  onPressIn,
  onPressOut,
  style,
  ...props
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={(state) => {
        const resolvedStyle = StyleSheet.flatten(
          typeof style === "function" ? style(state) : style,
        );
        const baseTransform = Array.isArray(resolvedStyle?.transform)
          ? [...resolvedStyle.transform]
          : [];
        return [
          resolvedStyle,
          {
            opacity: state.pressed ? 0.82 : resolvedStyle?.opacity,
            transform: [...baseTransform, { scale: state.pressed ? 0.985 : 1 }],
          },
        ];
      }}
    >
      {children}
    </Pressable>
  );
}
