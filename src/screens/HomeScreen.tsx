import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { WeekDateStrip } from "../components/WeekDateStrip";
import { YearGrassGrid } from "../components/YearGrassGrid";
import { YearMonthHeader } from "../components/YearMonthHeader";
import { theme } from "../theme";

function getProgressPercent(year: number, endDate: Date): number {
  const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const daysInYear = isLeap(year) ? 366 : 365;
  const start = new Date(year, 0, 0);
  const diff = endDate.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.min(100, Math.round((dayOfYear / daysInYear) * 100));
}

export function HomeScreen() {
  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  const progress = useMemo(
    () => getProgressPercent(year, today),
    [year, today]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <View style={styles.headerRow}>
          <YearMonthHeader year={year} month={month} />
        </View>
      </View>
      <View style={styles.dateStripWrap}>
        <WeekDateStrip year={year} month={month} todayDate={date} />
      </View>
      <View>
        <Text style={styles.progress}>{progress}% 완료</Text>
      </View>
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
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  dateStripWrap: {
    width: "100%",
  },
  progress: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  gridWrap: {
    width: "100%",
    alignItems: "center",
  },
});
