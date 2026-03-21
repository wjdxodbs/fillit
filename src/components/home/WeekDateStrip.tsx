import React, { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useTheme } from "../../stores/themeStore";
import { type Theme } from "../../theme";
import { CELL_GAP, GRID_HORIZONTAL_PADDING, WEEKDAYS } from "../../constants/gridConstants";

const COLUMNS = 7;
const CELL_VERTICAL_PADDING = 8;

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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
      paddingVertical: CELL_VERTICAL_PADDING,
    },
    weekdayCell: {
      justifyContent: "center",
      height: 20,
    },
    dateCell: {
      justifyContent: "center",
      height: 20,
      marginTop: 4,
    },
    todayBg: {
      backgroundColor: theme.grassFilled,
      borderRadius: 16,
    },
    weekdayText: {
      fontSize: 13,
      lineHeight: 16,
      color: theme.textSecondary,
      textAlign: "center",
    },
    weekdayTextToday: {
      color: "rgba(255,255,255,0.75)",
    },
    dateText: {
      fontSize: 14,
      lineHeight: 17,
      color: theme.text,
      textAlign: "center",
    },
    dateTextToday: {
      fontWeight: "700",
      color: "#fff",
    },
  });

export function WeekDateStrip({ year, month, todayDate }: WeekDateStripProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const cellWidth = useMemo(() => {
    const available = screenWidth - GRID_HORIZONTAL_PADDING;
    const totalGap = (COLUMNS - 1) * CELL_GAP;
    return Math.floor((available - totalGap) / COLUMNS);
  }, [screenWidth]);

  const { days, weekdayLabels } = useMemo(() => {
    const days: DayItem[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(year, month, todayDate - i);
      days.push({ date: d.getDate(), weekday: d.getDay(), isToday: i === 0 });
    }
    return { days, weekdayLabels: days.map((d) => WEEKDAYS[d.weekday]) };
  }, [year, month, todayDate]);

  return (
    <View style={styles.container}>
      <View style={styles.columnsRow}>
        {days.map((d, i) => (
          <View
            key={i}
            style={[
              styles.column,
              { width: cellWidth, marginRight: i < 6 ? CELL_GAP : 0 },
            ]}
          >
            {d.isToday && (
              <View style={[StyleSheet.absoluteFill, styles.todayBg]} />
            )}
            <View style={[styles.weekdayCell, { width: cellWidth }]}>
              <Text
                style={[
                  styles.weekdayText,
                  d.isToday && styles.weekdayTextToday,
                ]}
              >
                {weekdayLabels[i]}
              </Text>
            </View>
            <View style={[styles.dateCell, { width: cellWidth }]}>
              <Text
                style={[styles.dateText, d.isToday && styles.dateTextToday]}
              >
                {String(d.date)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
