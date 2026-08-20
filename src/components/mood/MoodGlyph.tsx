import { Circle, Line, Path, Svg } from "react-native-svg";

import { palette } from "@/constants/theme";
import type { MoodId } from "@/types";

type Props = {
  active?: boolean;
  moodId: MoodId;
  size?: number;
};

export function MoodGlyph({ active = false, moodId, size = 32 }: Props) {
  const stroke = active ? palette.cream : palette.creamMuted;
  const line = {
    fill: "none",
    stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  const mark = (() => {
    switch (moodId) {
      case "peaceful":
        return (
          <>
            <Circle {...line} cx="24" cy="19" r="6" />
            <Path {...line} d="M11 30c8-5 18-5 26 0" />
          </>
        );
      case "okay":
        return (
          <>
            <Circle cx="24" cy="17" fill={stroke} r="2" />
            <Line {...line} x1="14" x2="34" y1="28" y2="28" />
          </>
        );
      case "empty":
        return <Circle {...line} cx="24" cy="24" r="9" />;
      case "sad":
        return (
          <>
            <Path {...line} d="M15 17c7 2 13 8 17 16" />
            <Path {...line} d="M15 31c5-3 11-3 16 0" />
          </>
        );
      case "tired":
        return (
          <>
            <Line {...line} x1="14" x2="34" y1="20" y2="20" />
            <Path {...line} d="M14 29c6-3 14-3 20 0" />
          </>
        );
      case "angry":
        return (
          <>
            <Path {...line} d="m15 14 5 8-5 4 5 8" />
            <Path {...line} d="m33 14-5 8 5 4-5 8" />
          </>
        );
      case "anxious":
        return (
          <>
            <Path {...line} d="M11 20c4-6 8 6 13 0s9 6 13 0" />
            <Path {...line} d="M11 29c4-6 8 6 13 0s9 6 13 0" />
          </>
        );
      case "unsure":
        return (
          <>
            <Circle cx="16" cy="24" fill={stroke} r="1.8" />
            <Circle cx="24" cy="24" fill={stroke} r="1.8" />
            <Circle cx="32" cy="24" fill={stroke} r="1.8" />
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
        fill={active ? palette.mossWash : "transparent"}
        r="21"
        stroke={active ? palette.lineStrong : "transparent"}
        strokeWidth="1"
      />
      {mark}
    </Svg>
  );
}
