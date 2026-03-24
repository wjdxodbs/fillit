import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTodayStr } from "../hooks/useTodayStr";
import { useTheme } from "../stores/themeStore";
import { WeekDateStrip } from "../components/home/WeekDateStrip";
import { YearGrassGrid } from "../components/home/YearGrassGrid";
import { YearMonthHeader } from "../components/home/YearMonthHeader";
import { StatsCard } from "../components/common/StatsCard";
import { ThemeSelector } from "../components/ThemeSelector";
import { type Theme } from "../theme";
import { isLeapYear, getDayOfYear, calcProgress } from "../utils/dateUtils";

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 20,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    dateStripWrap: {
      width: "100%",
    },
    gridWrap: {
      width: "100%",
      alignItems: "flex-start",
    },
  });

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const todayStr = useTodayStr();
  const { today, year, month, date, elapsed, remaining, progress } = useMemo(() => {
    const today = new Date(todayStr + "T12:00:00");
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();
    const daysInYear = isLeapYear(year) ? 366 : 365;
    const elapsed = getDayOfYear(today);
    return {
      today,
      year,
      month,
      date,
      elapsed,
      remaining: daysInYear - elapsed,
      progress: Math.min(100, calcProgress(elapsed, daysInYear)),
    };
  }, [todayStr]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: 20 + insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <YearMonthHeader year={year} month={month} />
        <ThemeSelector />
      </View>
      <View style={styles.dateStripWrap}>
        <WeekDateStrip year={year} month={month} todayDate={date} />
      </View>
      <StatsCard progress={progress} elapsed={elapsed} remaining={remaining} />
      <View style={styles.gridWrap}>
        <YearGrassGrid year={year} endDate={today} />
      </View>
    </ScrollView>
  );
}
