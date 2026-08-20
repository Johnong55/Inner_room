import type { ComponentProps, ReactNode } from "react";
import { Pressable } from "react-native";

type Props = ComponentProps<typeof Pressable> & { children: ReactNode };

export function PressableScale({
  children,
  style,
  ...props
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={style}
    >
      {children}
    </Pressable>
  );
}
