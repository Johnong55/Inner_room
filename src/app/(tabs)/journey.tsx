import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";

import { EntryCard } from "@/components/journal/EntryCard";
import { MonthCalendar } from "@/components/journey/MonthCalendar";
import { Card } from "@/components/ui/Card";
import { EditorialLink } from "@/components/ui/EditorialLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { Screen } from "@/components/ui/Screen";
import { Type } from "@/components/ui/Type";
import { palette } from "@/constants/theme";
import { listJourneyMonth, type JourneyDaySummary } from "@/database";
import { buildMonthlyReflection } from "@/services/journal/reflection";
import { useJournalStore } from "@/stores/useJournalStore";

const beginningOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const monthValue = (date: Date) => date.getFullYear() * 12 + date.getMonth();

export default function JourneyScreen() {
  const router = useRouter();
  const entries = useJournalStore((state) => state.entries);
  const load = useJournalStore((state) => state.load);
  const [month, setMonth] = useState(beginningOfMonth);
  const [calendarDays, setCalendarDays] = useState<JourneyDaySummary[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setCalendarLoading(true);
      void Promise.all([load(), listJourneyMonth(year, monthIndex)])
        .then(([, days]) => {
          if (active) setCalendarDays(days);
        })
        .catch(() => {
          if (active) setCalendarDays([]);
        })
        .finally(() => {
          if (active) setCalendarLoading(false);
        });
      return () => {
        active = false;
      };
    }, [load, monthIndex, year]),
  );

  const monthEntries = entries.filter((entry) => {
    const createdAt = new Date(entry.createdAt);
    return (
      createdAt.getMonth() === monthIndex && createdAt.getFullYear() === year
    );
  });
  const reflection = buildMonthlyReflection(monthEntries);
  const canGoNext = monthValue(month) < monthValue(beginningOfMonth());
  const isCurrentMonth = monthValue(month) === monthValue(beginningOfMonth());

  const changeMonth = (offset: number) => {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  return (
    <Screen>
      <PageHeader
        title="Những ngày đã qua"
        subtitle="Cảm xúc là thông tin, không phải điểm số."
      />
      <MonthCalendar
        canGoNext={canGoNext}
        days={calendarDays}
        loading={calendarLoading}
        month={month}
        onChangeMonth={changeMonth}
        onOpenDay={(date) =>
          router.push({ pathname: "/journey/[date]", params: { date } })
        }
      />
      <Type variant="title" className="mb-4 mt-10">
        {isCurrentMonth
          ? "Tháng này của bạn"
          : `Tháng ${monthIndex + 1} của bạn`}
      </Type>
      <Card>
        <Type variant="eyebrow" muted>
          BẠN ĐÃ NGHĨ NHIỀU VỀ
        </Type>
        {reflection.mentionedTopics.length ? (
          <View className="mt-4 flex-row flex-wrap gap-2">
            {reflection.mentionedTopics.map((topic) => (
              <View
                key={topic.label}
                className="rounded-full px-4 py-2"
                style={{ backgroundColor: palette.inkSoft }}
              >
                <Type variant="small">{topic.label}</Type>
              </View>
            ))}
          </View>
        ) : (
          <Type muted className="mt-3">
            Chưa có đủ trang viết trong tháng để nhận ra điều này.
          </Type>
        )}
        <Type variant="eyebrow" muted className="mt-7">
          ĐIỀU KHIẾN BẠN NHẸ LÒNG HƠN
        </Type>
        {reflection.easingEntries.length ? (
          reflection.easingEntries.map((entry) => (
            <Type key={entry.id} className="mt-3">
              • {entry.body.slice(0, 120)}
              {entry.body.length > 120 ? "…" : ""}
            </Type>
          ))
        ) : (
          <Type muted className="mt-3">
            Mình chưa thấy đủ bằng chứng trong những điều bạn đã viết.
          </Type>
        )}
        <Type variant="eyebrow" muted className="mt-7">
          ĐIỀU BẠN ĐÃ VƯỢT QUA
        </Type>
        <Type muted className="mt-3">
          Cần thêm thời gian để nhận ra một chuyện từng nặng lòng có thật sự
          xuất hiện ít dần hay không. InnerRoom sẽ không đoán thay bạn.
        </Type>
        {reflection.favorite ? (
          <View
            className="mt-7 border-t pt-6"
            style={{ borderColor: palette.line }}
          >
            <Type variant="eyebrow" style={{ color: palette.ember }}>
              MỘT CÂU BẠN TỪNG VIẾT
            </Type>
            <Type className="mt-4 italic">
              “{reflection.favorite.body.slice(0, 180)}
              {reflection.favorite.body.length > 180 ? "…" : ""}”
            </Type>
          </View>
        ) : null}
      </Card>
      <EditorialLink
        accent={palette.rain}
        className="mt-4"
        description="Gửi nguyên vẹn đến một ngày trong tương lai."
        kicker="GỬI VỀ PHÍA TRƯỚC"
        onPress={() => router.push("/letters")}
        title="Một lá thư cho mình"
      />
      <Type variant="eyebrow" muted className="mb-3 mt-10">
        NHỮNG TRANG TRONG THÁNG
      </Type>
      <View className="gap-3">
        {monthEntries.length ? (
          monthEntries
            .slice(0, 6)
            .map((entry) => <EntryCard key={entry.id} entry={entry} />)
        ) : (
          <Type muted>Tháng này chưa có trang viết nào.</Type>
        )}
      </View>
    </Screen>
  );
}
