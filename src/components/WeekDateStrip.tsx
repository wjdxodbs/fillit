import React, { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { useGrassColor } from "../contexts/GrassColorContext";
import { theme } from "../theme";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

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
  const { color: grassColor } = useGrassColor();
  const [containerWidth, setContainerWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setContainerWidth(w);
  };
  const cellWidth = useMemo(() => {
    if (containerWidth <= 0) return 40;
    return Math.floor(containerWidth / 7);
  }, [containerWidth]);

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
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.inner}>
        <View style={styles.weekdayRow}>
          {weekdayLabels.map((label, i) => (
            <View key={i} style={[styles.weekdayCell, { width: cellWidth }]}>
              <Text style={styles.weekdayText}>{label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.dateRow}>
          {days.map((d, i) => (
            <View
              key={i}
              style={[styles.dateCell, { width: cellWidth, height: cellWidth }]}
            >
              <View
                style={[
                  styles.dateInner,
                  {
                    width: d.isToday ? cellWidth * 0.68 : cellWidth,
                    height: d.isToday ? cellWidth * 0.68 : cellWidth,
                    borderRadius: d.isToday ? (cellWidth * 0.68) / 2 : 0,
                    backgroundColor: d.isToday ? grassColor : undefined,
                  },
                ]}
              >
                <View
                  style={[
                    styles.dateTextBox,
                    {
                      width: Math.min(
                        Math.max(40, cellWidth - 4),
                        d.isToday ? cellWidth * 0.68 : cellWidth
                      ),
                    },
                  ]}
                >
                  <Text
                    style={[styles.dateText, d.isToday && styles.dateTextToday]}
                  >
                    {String(d.date)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  inner: {
    width: "100%",
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 4,
    marginLeft: 0,
    paddingLeft: 0,
  },
  weekdayCell: {
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayText: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  dateRow: {
    flexDirection: "row",
    marginLeft: 0,
    paddingLeft: 0,
  },
  dateCell: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  dateInner: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  dateTextBox: {},
  dateText: {
    fontSize: 14,
    color: theme.text,
    textAlign: "center",
  },
  dateTextToday: {
    color: "#fff",
    fontWeight: "600",
  },
});
