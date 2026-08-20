import { Tabs } from "expo-router";

import { InnerRoomTabBar } from "@/components/navigation/InnerRoomTabBar";
import { palette } from "@/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <InnerRoomTabBar {...props} />}
      screenOptions={{
        animation: "none",
        headerShown: false,
        sceneStyle: { backgroundColor: palette.ink },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="journal" options={{ title: "Journal" }} />
      <Tabs.Screen name="room" options={{ title: "Room" }} />
      <Tabs.Screen name="journey" options={{ title: "Journey" }} />
      <Tabs.Screen name="profile" options={{ title: "You" }} />
    </Tabs>
  );
}
