import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { palette } from "@/constants/theme";
import type { JourneyDaySummary } from "@/database";
import { MoodGlyph } from "../mood/MoodGlyph";
import { Card } from "../ui/Card";
import { PressableScale } from "../ui/PressableScale";
import { Type } from "../ui/Type";

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

type Props = {
  canGoNext: boolean;
  days: JourneyDaySummary[];
  loading?: boolean;
  month: Date;
  onChangeMonth: (offset: number) => void;
  onOpenDay: (date: string) => void;
};

export function MonthCalendar({
  canGoNext,
  days,
  loading = false,
  month,
  onChangeMonth,
  onOpenDay,
}: Props) {
  const summaries = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days],
  );
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const leadingCells = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const today = dateKey(new Date());
  const monthLabel = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(month);

  return (
    <Card className="px-3 pb-4 pt-4">
      <View className="mb-4 flex-row items-center justify-between px-1">
        <PressableScale
          accessibilityLabel="Xem tháng trước"
          className="h-11 w-11 items-center justify-center rounded-full"
          onPress={() => onChangeMonth(-1)}
          style={{ backgroundColor: palette.inkSoft }}
        >
          <Type variant="heading">‹</Type>
        </PressableScale>
        <View className="items-center">
          <Type variant="eyebrow" style={{ color: palette.moss }}>
            LỊCH CỦA BẠN
          </Type>
          <Type variant="heading" className="mt-0.5 capitalize">
            {monthLabel}
          </Type>
        </View>
        <PressableScale
          accessibilityLabel="Xem tháng sau"
          className="h-11 w-11 items-center justify-center rounded-full"
          disabled={!canGoNext}
          onPress={() => onChangeMonth(1)}
          style={{
            backgroundColor: palette.inkSoft,
            opacity: canGoNext ? 1 : 0.35,
          }}
        >
          <Type variant="heading">›</Type>
        </PressableScale>
      </View>

      <View className="mb-1 flex-row">
        {weekdays.map((weekday) => (
          <View key={weekday} style={styles.column}>
            <Type variant="eyebrow" muted className="text-center">
              {weekday}
            </Type>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {Array.from({ length: 42 }, (_, index) => {
          const dayNumber = index - leadingCells + 1;
          if (dayNumber < 1 || dayNumber > daysInMonth) {
            return <View key={`empty-${index}`} style={styles.column} />;
          }

          const value = dateKey(
            new Date(month.getFullYear(), month.getMonth(), dayNumber),
          );
          const summary = summaries.get(value);
          const isToday = value === today;

          return (
            <View key={value} style={styles.column}>
              <PressableScale
                accessibilityLabel={
                  summary
                    ? `Mở ngày ${dayNumber}, có ${summary.activities.length} loại nội dung`
                    : `Ngày ${dayNumber}, không có nội dung`
                }
                disabled={!summary || loading}
                onPress={() => onOpenDay(value)}
                style={[
                  styles.day,
                  summary ? styles.dayWithContent : null,
                  isToday ? styles.today : null,
                ]}
              >
                <Type
                  variant="small"
                  style={{
                    color: summary ? palette.cream : palette.fogDim,
                    fontFamily: isToday
                      ? "Manrope_600SemiBold"
                      : "Manrope_500Medium",
                  }}
                >
                  {dayNumber}
                </Type>
                {summary?.moodId ? (
                  <MoodGlyph moodId={summary.moodId} size={27} />
                ) : summary ? (
                  <View style={styles.activityDot} />
                ) : null}
              </PressableScale>
            </View>
          );
        })}
      </View>

      <View
        className="mx-2 mt-3 border-t pt-3"
        style={{ borderColor: palette.line }}
      >
        <Type variant="small" muted className="text-center">
          Chạm vào ngày có nét mặt hoặc dấu chấm để mở lại.
        </Type>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  activityDot: {
    backgroundColor: palette.moss,
    borderRadius: 4,
    height: 5,
    marginTop: 8,
    width: 5,
  },
  column: {
    alignItems: "center",
    minHeight: 59,
    padding: 2,
    width: "14.285714%",
  },
  day: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 17,
    borderWidth: 1,
    height: 55,
    justifyContent: "center",
    width: "100%",
  },
  dayWithContent: {
    backgroundColor: palette.inkSoft,
  },
  today: {
    borderColor: palette.moss,
  },
});
