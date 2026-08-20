import { ChevronLeft, ShieldAlert } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { PressableScale } from "@/components/ui/PressableScale";
import { Type } from "@/components/ui/Type";
import { conversationModes, responseIntents } from "@/constants/content";
import { palette } from "@/constants/theme";
import { createConversation, createId, saveMessage } from "@/database";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { requestReflection } from "@/services/ai/reflectionClient";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import type {
  ChatMessage,
  ConversationModeId,
  ResponseIntentId,
} from "@/types";

export default function ConversationScreen() {
  const params = useLocalSearchParams<{
    mode?: ConversationModeId;
    intent?: ResponseIntentId;
  }>();
  const router = useRouter();
  const modeId = params.mode ?? "mirror";
  const mode =
    conversationModes.find((item) => item.id === modeId) ??
    conversationModes[0];
  const [intent, setIntent] = useState<ResponseIntentId>(
    params.intent ?? (modeId === "listen" ? "listen" : "understand"),
  );
  const [intentOpen, setIntentOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [composerHeight, setComposerHeight] = useState(0);
  const conversationId = useRef<Promise<string> | null>(null);
  const scroll = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const composerBottom =
    keyboardHeight > 0 ? keyboardHeight + 8 : insets.bottom;
  const memoryEnabled = usePreferencesStore((state) => state.memoryEnabled);
  const aiHistoryEnabled = usePreferencesStore(
    (state) => state.aiHistoryEnabled,
  );
  const anonymousMode = usePreferencesStore((state) => state.anonymousMode);
  const intentLabel = useMemo(
    () => responseIntents.find((item) => item.id === intent)?.label,
    [intent],
  );

  useEffect(() => {
    if (keyboardHeight <= 0) return;
    const timer = setTimeout(
      () => scroll.current?.scrollToEnd({ animated: true }),
      80,
    );
    return () => clearTimeout(timer);
  }, [keyboardHeight]);

  const persist = async (message: ChatMessage) => {
    if (!aiHistoryEnabled) return;
    conversationId.current ??= createConversation(modeId);
    await saveMessage(await conversationId.current, message);
  };

  const send = async () => {
    const content = input.trim();
    if (!content || sending) return;
    const userMessage: ChatMessage = {
      id: createId("message"),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setSending(true);
    await persist(userMessage);
    try {
      const response = await requestReflection({
        mode: modeId,
        intent,
        messages: next,
        memoryEnabled,
        anonymousMode,
      });
      const reflection: ChatMessage = {
        id: createId("message"),
        role: "reflection",
        content: response.content,
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, reflection]);
      await persist(reflection);
      if (response.safetyEscalation)
        setTimeout(() => router.push("/safety"), 600);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createId("message"),
          role: "reflection",
          content:
            "Kết nối đang không ổn. Điều bạn vừa viết vẫn chỉ ở trên thiết bị này. Bạn có thể tiếp tục viết, hoặc quay lại khi muốn.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-ink">
      <View className="flex-1">
        <View
          className="flex-row items-center border-b px-5 pb-4 pt-3"
          style={{ borderColor: palette.line }}
        >
          <PressableScale
            accessibilityLabel="Đóng cuộc trò chuyện"
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: palette.inkSoft }}
          >
            <ChevronLeft color={palette.cream} size={20} />
          </PressableScale>
          <View className="ml-4 flex-1">
            <Type variant="eyebrow" style={{ color: palette.moss }}>
              MỘT CUỘC TRÒ CHUYỆN
            </Type>
            <Type variant="heading" className="mt-0.5">
              {mode.title}
            </Type>
            <Type variant="small" muted>
              {aiHistoryEnabled ? "Lịch sử lưu trên máy" : "Không lưu lịch sử"}
            </Type>
          </View>
        </View>
        <ScrollView
          ref={scroll}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            paddingBottom: composerHeight + composerBottom + 20,
          }}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          {!messages.length ? (
            <View className="flex-1 justify-center py-16">
              <Type variant="title">
                Bạn có thể bắt đầu từ điều khó nói nhất.
              </Type>
              <Type muted className="mt-4">
                Mình sẽ nghe trước. Không cần kể mọi thứ theo đúng thứ tự.
              </Type>
            </View>
          ) : (
            messages.map((message) => (
              <Animated.View
                key={message.id}
                entering={FadeInUp.duration(500)}
                className={`mb-4 max-w-[88%] rounded-[22px] px-5 py-4 ${message.role === "user" ? "self-end rounded-br-md" : "self-start rounded-bl-md"}`}
                style={{
                  backgroundColor:
                    message.role === "user"
                      ? palette.inkSoft
                      : palette.mossWash,
                  borderWidth: message.role === "reflection" ? 1 : 0,
                  borderColor: palette.line,
                }}
              >
                <Type className="leading-7">{message.content}</Type>
                {message.role === "reflection" &&
                /không an toàn/i.test(message.content) ? (
                  <View className="mt-4 flex-row items-center">
                    <ShieldAlert color={palette.danger} size={15} />
                    <Type
                      variant="small"
                      className="ml-2"
                      style={{ color: palette.danger }}
                    >
                      Ưu tiên an toàn ngay lúc này
                    </Type>
                  </View>
                ) : null}
              </Animated.View>
            ))
          )}
          {sending ? (
            <Type muted className="px-2 py-3">
              Đang ngồi lại cùng điều bạn vừa nói…
            </Type>
          ) : null}
        </ScrollView>
        <View
          onLayout={(event) =>
            setComposerHeight(event.nativeEvent.layout.height)
          }
          className="border-t px-4 pb-3 pt-3"
          style={{
            backgroundColor: palette.tabBar,
            borderColor: palette.line,
            bottom: composerBottom,
            left: 0,
            position: "absolute",
            right: 0,
          }}
        >
          <PressableScale
            onPress={() => setIntentOpen((value) => !value)}
            className="mb-3 flex-row items-center self-start rounded-full px-4 py-2"
            style={{ backgroundColor: palette.inkSoft }}
          >
            <Type variant="small">{intentLabel}</Type>
            <Type
              variant="eyebrow"
              className="ml-3"
              style={{ color: palette.moss }}
            >
              ĐỔI
            </Type>
          </PressableScale>
          {intentOpen ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              {responseIntents.map((item) => (
                <PressableScale
                  key={item.id}
                  onPress={() => {
                    setIntent(item.id);
                    setIntentOpen(false);
                  }}
                  className="mr-2 rounded-full border px-4 py-2"
                  style={{
                    borderColor:
                      item.id === intent ? palette.moss : palette.line,
                    backgroundColor:
                      item.id === intent ? palette.mossWash : palette.inkRaised,
                  }}
                >
                  <Type variant="small">{item.label}</Type>
                </PressableScale>
              ))}
            </ScrollView>
          ) : null}
          <Type variant="small" muted className="mb-2">
            Bạn muốn mình làm gì lúc này?
          </Type>
          <View
            className="flex-row items-end rounded-[24px] border p-2 pl-4"
            style={{
              borderColor: palette.line,
              backgroundColor: palette.inkRaised,
            }}
          >
            <TextInput
              multiline
              value={input}
              onChangeText={setInput}
              onFocus={() =>
                setTimeout(
                  () => scroll.current?.scrollToEnd({ animated: true }),
                  100,
                )
              }
              placeholder="Nói điều đang ở trong đầu bạn…"
              placeholderTextColor={palette.placeholder}
              className="max-h-32 min-h-[42px] flex-1 py-2 font-sans text-[15px] leading-6 text-cream"
            />
            <PressableScale
              disabled={!input.trim() || sending}
              onPress={() => void send()}
              className="h-11 items-center justify-center rounded-full px-4"
              style={{
                backgroundColor: input.trim() ? palette.cream : palette.inkSoft,
              }}
            >
              <Type
                variant="eyebrow"
                style={{ color: input.trim() ? palette.ink : palette.fog }}
              >
                GỬI
              </Type>
            </PressableScale>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
