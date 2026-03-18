import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WeekDateStrip } from "../components/WeekDateStrip";
import { YearGrassGrid } from "../components/YearGrassGrid";
import { YearMonthHeader } from "../components/YearMonthHeader";
import { StatsCard } from "../components/StatsCard";
import { theme } from "../theme";
import { isLeapYear, getDayOfYear, calcProgress } from "../utils/dateUtils";

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [today, setToday] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      setToday(new Date());
    }, []),
  );
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  const daysInYear = isLeapYear(year) ? 366 : 365;
  const elapsed = getDayOfYear(today);
  const remaining = daysInYear - elapsed;
  const progress = Math.min(100, calcProgress(elapsed, daysInYear));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: 20 + insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <YearMonthHeader year={year} month={month} />
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

const styles = StyleSheet.create({
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
