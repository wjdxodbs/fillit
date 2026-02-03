import React, { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { theme } from "../theme";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const CELL_GAP = 6;
const COLUMNS = 7;
/** 잔디 그리드와 동일한 좌우 여백 */
const GRID_HORIZONTAL_PADDING = 40;
const WEEKDAY_HEIGHT = 20;
const WEEKDAY_MARGIN_BOTTOM = 4;
const BORDER_VERTICAL_PADDING = 8;

interface DayItem {
  date: number;
  weekday: number;
  isToday: boolean;
}

interface WeekDateStripProps {
  year: number;
  month: number;
  todayDate: number;
}

export function WeekDateStrip({ year, month, todayDate }: WeekDateStripProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { cellWidth, columnHeight } = useMemo(() => {
    const available = screenWidth - GRID_HORIZONTAL_PADDING;
    const totalGap = (COLUMNS - 1) * CELL_GAP;
    const cw = Math.floor((available - totalGap) / COLUMNS);
    const ch =
      WEEKDAY_HEIGHT + WEEKDAY_MARGIN_BOTTOM + cw + BORDER_VERTICAL_PADDING * 2;
    return { cellWidth: cw, columnHeight: ch };
  }, [screenWidth]);

  const { days, weekdayLabels } = useMemo(() => {
    const days: DayItem[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(year, month, todayDate - i);
      days.push({
        date: d.getDate(),
        weekday: d.getDay(),
        isToday: i === 0,
      });
    }
    const weekdayLabels = days.map((d) => WEEKDAYS[d.weekday]);
    return { days, weekdayLabels };
  }, [year, month, todayDate]);

  return (
    <View style={styles.container}>
      <View style={styles.columnsRow}>
        {days.map((d, i) => {
          const label = weekdayLabels[i];
          const columnStyle = {
            width: cellWidth,
            height: columnHeight,
            marginRight: i < 6 ? CELL_GAP : 0,
          };
          const innerCellStyle = { width: cellWidth };
          const content = (
            <>
              <View style={[styles.weekdayCell, innerCellStyle]}>
                <Text style={styles.weekdayText}>{label}</Text>
              </View>
              <View
                style={[styles.dateCell, innerCellStyle, { height: cellWidth }]}
              >
                <Text
                  style={[styles.dateText, d.isToday && styles.dateTextToday]}
                >
                  {String(d.date)}
                </Text>
              </View>
            </>
          );
          if (d.isToday) {
            return (
              <View key={i} style={[styles.column, columnStyle]}>
                <View
                  style={[
                    styles.todayBorderWrap,
                    { borderColor: theme.grassFilled },
                  ]}
                >
                  <View style={styles.todayBorderInner}>{content}</View>
                </View>
              </View>
            );
          }
          return (
            <View key={i} style={[styles.column, columnStyle]}>
              {content}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  columnsRow: {
    flexDirection: "row",
  },
  column: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  todayBorderWrap: {
    width: "100%",
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  todayBorderInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  weekdayCell: {
    height: WEEKDAY_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: WEEKDAY_MARGIN_BOTTOM,
  },
  weekdayText: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  dateCell: {
    justifyContent: "center",
  },
  dateText: {
    fontSize: 14,
    color: theme.text,
    textAlign: "center",
  },
  dateTextToday: {
    fontWeight: "700",
    color: theme.text,
  },
});
