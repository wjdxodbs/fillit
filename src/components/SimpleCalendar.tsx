import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../theme";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const CALENDAR_WEEKS = 6;
const CALENDAR_ROW_HEIGHT = 36;
const CALENDAR_ROW_GAP = 4;
const CALENDAR_GRID_HEIGHT =
  CALENDAR_WEEKS * (CALENDAR_ROW_HEIGHT + CALENDAR_ROW_GAP) - CALENDAR_ROW_GAP;
const CALENDAR_HEADER_HEIGHT = 44;
const CALENDAR_WEEKDAY_ROW_HEIGHT = 28;
const CALENDAR_TOTAL_HEIGHT =
  CALENDAR_HEADER_HEIGHT +
  12 +
  CALENDAR_WEEKDAY_ROW_HEIGHT +
  CALENDAR_ROW_GAP +
  CALENDAR_GRID_HEIGHT;
const MIN_DAY_CELL_WIDTH = 32;
const CALENDAR_MIN_WIDTH = 7 * MIN_DAY_CELL_WIDTH;

interface SimpleCalendarProps {
  year: number;
  month: number;
  minimumDate: Date;
  maximumDate?: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export function SimpleCalendar({
  year,
  month,
  minimumDate,
  maximumDate,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  canGoPrev,
  canGoNext,
}: SimpleCalendarProps) {
  const weeks = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length < CALENDAR_WEEKS * 7) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < CALENDAR_WEEKS * 7; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [year, month]);

  const dateStr = (day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const isSelectable = (day: number | null) => {
    if (day === null) return false;
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const t = d.getTime();
    if (t < minimumDate.getTime()) return false;
    if (maximumDate && t > maximumDate.getTime()) return false;
    return true;
  };

  const isSelected = (day: number | null) =>
    day !== null && selectedDate === dateStr(day);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onPrevMonth}
          disabled={!canGoPrev}
          style={styles.navBtn}
        >
          <Text style={[styles.navText, !canGoPrev && styles.navDisabled]}>
            ‹
          </Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {year}년 {month + 1}월
        </Text>
        <TouchableOpacity
          onPress={onNextMonth}
          disabled={!canGoNext}
          style={styles.navBtn}
        >
          <Text style={[styles.navText, !canGoNext && styles.navDisabled]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((w) => (
          <View key={w} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{w}</Text>
          </View>
        ))}
      </View>
      <View style={styles.gridBody}>
        {weeks.map((row, ri) => (
          <View key={ri} style={styles.weekRow}>
            {row.map((day, ci) => {
              const selectable = isSelectable(day);
              const selected = isSelected(day);
              return (
                <TouchableOpacity
                  key={ci}
                  style={[styles.dayCell, !selectable && styles.dayCellDisabled]}
                  onPress={() => {
                    if (day !== null && selectable) {
                      onSelectDate(dateStr(day));
                    }
                  }}
                  disabled={!selectable}
                >
                  <View
                    style={[
                      styles.dayCellInner,
                      selected && styles.dayCellInnerSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !selectable && styles.dayTextDisabled,
                        selected && styles.dayTextSelected,
                      ]}
                      numberOfLines={1}
                      allowFontScaling={false}
                    >
                      {day ?? ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    height: CALENDAR_TOTAL_HEIGHT,
    minWidth: CALENDAR_MIN_WIDTH,
  },
  gridBody: {
    height: CALENDAR_GRID_HEIGHT,
    overflow: "visible",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: CALENDAR_HEADER_HEIGHT,
    marginBottom: 12,
  },
  navBtn: { padding: 13 },
  navText: { fontSize: 22, color: theme.text, fontWeight: "600" },
  navDisabled: { color: theme.textSecondary, opacity: 0.5 },
  monthTitle: { fontSize: 16, fontWeight: "600", color: theme.text },
  weekRow: {
    flexDirection: "row",
    height: CALENDAR_ROW_HEIGHT,
    marginBottom: CALENDAR_ROW_GAP,
    overflow: "visible",
  },
  weekdayRow: {
    flexDirection: "row",
    height: CALENDAR_WEEKDAY_ROW_HEIGHT,
    marginBottom: CALENDAR_ROW_GAP,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayText: { fontSize: 12, color: theme.textSecondary, fontWeight: "600" },
  dayCell: {
    flex: 1,
    minWidth: MIN_DAY_CELL_WIDTH,
    height: CALENDAR_ROW_HEIGHT,
    maxHeight: CALENDAR_ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellDisabled: {},
  dayCellInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellInnerSelected: {
    backgroundColor: theme.grassFilled,
  },
  dayText: {
    fontSize: 13,
    color: theme.text,
    textAlign: "center",
  },
  dayTextDisabled: { color: theme.textSecondary, opacity: 0.4 },
  dayTextSelected: { color: "#fff", fontWeight: "600" },
});
