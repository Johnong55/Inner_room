import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { Type } from "@/components/ui/Type";
import { conversationModes, moods } from "@/constants/content";
import { getDayDetails, type DayDetails } from "@/database";

export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [details, setDetails] = useState<DayDetails | null>(null);
  useEffect(() => {
    void getDayDetails(date).then(setDetails);
  }, [date]);
  const title = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));
  const mood = moods.find((item) => item.id === details?.moodId);
  return (
    <Screen>
      <PageHeader
        back
        title={title}
        subtitle={
          mood ? mood.label : "Ngày này không có cảm xúc nào được chọn."
        }
      />
      {!details ? (
        <Type muted>Đang mở lại ngày này…</Type>
      ) : (
        <View className="gap-4">
          <Type variant="eyebrow" muted>
            NHỮNG ĐIỀU ĐÃ VIẾT
          </Type>
          {details.journals.length ? (
            details.journals.map((entry) => (
              <Card key={entry.id}>
                <Type className="leading-7">{entry.body}</Type>
              </Card>
            ))
          ) : (
            <Type muted>Không có trang nhật ký nào trong ngày này.</Type>
          )}
          {details.thoughts.length ? (
            <>
              <Type variant="eyebrow" muted className="mt-5">
                NHỮNG SUY NGHĨ ĐÃ GỠ
              </Type>
              {details.thoughts.map((thought) => (
                <Card key={thought.id}>
                  <Type variant="heading">{thought.thought}</Type>
                  {thought.facts ? (
                    <Type muted className="mt-3">
                      Sự thật: {thought.facts}
                    </Type>
                  ) : null}
                  {thought.assumptions ? (
                    <Type muted className="mt-3">
                      Điều đã suy đoán: {thought.assumptions}
                    </Type>
                  ) : null}
                  {thought.action ? (
                    <Type className="mt-3">
                      Một việc trong tay: {thought.action}
                    </Type>
                  ) : null}
                </Card>
              ))}
            </>
          ) : null}
          {details.conversations.length ? (
            <>
              <Type variant="eyebrow" muted className="mt-5">
                NHỮNG CUỘC TRÒ CHUYỆN
              </Type>
              {details.conversations.map((conversation) => (
                <Card key={conversation.id}>
                  <Type variant="heading">
                    {conversationModes.find(
                      (item) => item.id === conversation.mode,
                    )?.title ?? "Trò chuyện"}
                  </Type>
                  {conversation.messages.map((message) => (
                    <Type
                      key={message.id}
                      muted={message.role === "reflection"}
                      className="mt-3"
                    >
                      {message.role === "user" ? "Bạn: " : "Phản chiếu: "}
                      {message.content}
                    </Type>
                  ))}
                </Card>
              ))}
            </>
          ) : null}
          {details.letters.length ? (
            <>
              <Type variant="eyebrow" muted className="mt-5">
                ĐIỀU MUỐN NHỚ
              </Type>
              {details.letters.map((letter) => (
                <Card key={letter.id}>
                  {new Date(letter.deliverAt) <= new Date() ? (
                    <Type>{letter.body}</Type>
                  ) : (
                    <>
                      <Type variant="heading">
                        Một lá thư đang được giữ kín
                      </Type>
                      <Type muted className="mt-2">
                        Mở vào{" "}
                        {new Intl.DateTimeFormat("vi-VN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(new Date(letter.deliverAt))}
                      </Type>
                    </>
                  )}
                </Card>
              ))}
            </>
          ) : null}
          <Type muted className="mt-5 text-center">
            Ngày này là một phần câu chuyện, không phải một nhãn dán.
          </Type>
        </View>
      )}
    </Screen>
  );
}
