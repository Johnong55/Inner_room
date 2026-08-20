import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { type ComponentProps, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette } from "@/constants/theme";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { PressableScale } from "../ui/PressableScale";
import { Type } from "../ui/Type";

type TabBarRenderer = NonNullable<ComponentProps<typeof Tabs>["tabBar"]>;
type TabBarProps = Parameters<TabBarRenderer>[0];

const destinations = {
  index: "Hôm nay",
  journal: "Viết",
  room: "Phòng",
  journey: "Ngày qua",
  profile: "Của bạn",
} as const;

export function InnerRoomTabBar({
  state,
  descriptors,
  navigation,
}: TabBarProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const [dockWidth, setDockWidth] = useState(0);
  const activeIndex = useSharedValue(state.index);
  const reduceMotion = useReducedMotion();
  const itemWidth = dockWidth > 0 ? (dockWidth - 12) / state.routes.length : 0;

  useEffect(() => {
    activeIndex.value = reduceMotion
      ? state.index
      : withTiming(state.index, {
          duration: 120,
          easing: Easing.out(Easing.cubic),
        });
  }, [activeIndex, reduceMotion, state.index]);

  const indicatorStyle = useAnimatedStyle(
    () => ({
      opacity: itemWidth > 0 ? 1 : 0,
      transform: [{ translateX: activeIndex.value * itemWidth }],
      width: itemWidth,
    }),
    [itemWidth],
  );

  if (keyboardHeight > 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.positioner, { bottom: Math.max(insets.bottom, 10) }]}
    >
      <View
        onLayout={(event) => setDockWidth(event.nativeEvent.layout.width)}
        style={styles.dock}
      >
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const option = descriptors[route.key].options;
          const label =
            destinations[route.name as keyof typeof destinations] ?? "Hôm nay";

          const onPress = () => {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: "tabPress",
            });
            if (!focused && !event.defaultPrevented) {
              void Haptics.selectionAsync();
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <PressableScale
              key={route.key}
              accessibilityLabel={option.tabBarAccessibilityLabel}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              onLongPress={() =>
                navigation.emit({
                  target: route.key,
                  type: "tabLongPress",
                })
              }
              onPress={onPress}
              style={styles.touchTarget}
              testID={option.tabBarButtonTestID}
            >
              <Type
                variant="small"
                style={focused ? styles.activeLabel : styles.restingLabel}
              >
                {label}
              </Type>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeLabel: {
    color: palette.cream,
    fontFamily: "Manrope_600SemiBold",
    fontSize: 11.5,
    lineHeight: 16,
  },
  dock: {
    alignItems: "center",
    backgroundColor: palette.cardGlass,
    borderColor: palette.line,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 8,
    flexDirection: "row",
    height: 60,
    paddingHorizontal: 6,
    shadowColor: "#03090c",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
  },
  indicator: {
    backgroundColor: palette.mossWash,
    borderColor: `${palette.moss}38`,
    borderRadius: 19,
    borderWidth: 1,
    bottom: 6,
    left: 6,
    position: "absolute",
    top: 6,
  },
  positioner: {
    left: 14,
    position: "absolute",
    right: 14,
  },
  restingLabel: {
    color: palette.fogDim,
    fontFamily: "Manrope_500Medium",
    fontSize: 11.5,
    lineHeight: 16,
  },
  touchTarget: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
  },
});
