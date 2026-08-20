import { Circle, Line, Path, Svg } from "react-native-svg";

import { palette } from "@/constants/theme";
import type { MoodId } from "@/types";

const accents: Record<MoodId, string> = {
  angry: "#c49a82",
  anxious: "#99a9c2",
  empty: "#9aa8aa",
  okay: "#adc0a7",
  peaceful: "#9eb8a7",
  sad: "#91a8be",
  tired: "#b9a78f",
  unsure: "#94a3aa",
};

type Props = {
  active?: boolean;
  moodId: MoodId;
  size?: number;
};

export function MoodGlyph({ active = false, moodId, size = 34 }: Props) {
  const accent = accents[moodId];
  const stroke = active ? palette.cream : accent;
  const common = {
    fill: "none",
    stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  const face = (() => {
    switch (moodId) {
      case "peaceful":
        return (
          <>
            <Path {...common} d="M14 20c2 3 5 3 7 0M27 20c2 3 5 3 7 0" />
            <Path {...common} d="M17 29c4 5 10 5 14 0" />
          </>
        );
      case "okay":
        return (
          <>
            <Circle cx="17" cy="20" fill={stroke} r="1.6" />
            <Circle cx="31" cy="20" fill={stroke} r="1.6" />
            <Path {...common} d="M17 29c4 5 10 5 14 0" />
          </>
        );
      case "empty":
        return (
          <>
            <Circle cx="17" cy="20" fill={stroke} r="1.5" />
            <Circle cx="31" cy="20" fill={stroke} r="1.5" />
            <Line {...common} x1="18" x2="30" y1="30" y2="30" />
          </>
        );
      case "sad":
        return (
          <>
            <Circle cx="17" cy="21" fill={stroke} r="1.5" />
            <Circle cx="31" cy="21" fill={stroke} r="1.5" />
            <Path {...common} d="M17 33c4-5 10-5 14 0" />
            <Path {...common} d="M34 25c2 3 2 5 0 6-2-1-2-3 0-6Z" />
          </>
        );
      case "tired":
        return (
          <>
            <Path {...common} d="M14 21c2 2 5 2 7 0M27 21c2 2 5 2 7 0" />
            <Path {...common} d="M18 31c3-2 9-2 12 0" />
          </>
        );
      case "angry":
        return (
          <>
            <Path {...common} d="m14 18 7 3m13-3-7 3" />
            <Circle cx="18" cy="24" fill={stroke} r="1.4" />
            <Circle cx="30" cy="24" fill={stroke} r="1.4" />
            <Path {...common} d="M17 34c4-5 10-5 14 0" />
          </>
        );
      case "anxious":
        return (
          <>
            <Circle cx="17" cy="20" fill={stroke} r="2" />
            <Circle cx="31" cy="20" fill={stroke} r="2" />
            <Path {...common} d="M16 31c2-4 4 4 7 0s5 4 9 0" />
          </>
        );
      case "unsure":
        return (
          <>
            <Path {...common} d="m14 18 7-1m6 1 7 2" />
            <Circle cx="18" cy="22" fill={stroke} r="1.5" />
            <Circle cx="30" cy="22" fill={stroke} r="1.5" />
            <Path {...common} d="M18 31c4-2 8 2 12 0" />
          </>
        );
    }
  })();

  return (
    <Svg
      accessibilityElementsHidden
      height={size}
      viewBox="0 0 48 48"
      width={size}
    >
      <Circle
        cx="24"
        cy="24"
        fill={accent}
        fillOpacity={active ? 0.24 : 0.12}
        r="21"
        stroke={accent}
        strokeOpacity={active ? 0.9 : 0.52}
        strokeWidth="1.2"
      />
      <Circle cx="24" cy="24" fill={accent} fillOpacity="0.05" r="16.5" />
      {face}
    </Svg>
  );
}
