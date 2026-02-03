import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RangeGrassGrid } from "../components/RangeGrassGrid";
import { theme } from "../theme";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}년 ${m}월 ${day}일`;
}

function getDaysBetween(base: Date, target: Date): number {
  const a = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

type DateDetailScreenProps = {
  route: { params: { title: string; baseDate: string; targetDate: string } };
};

export function DateDetailScreen({ route }: DateDetailScreenProps) {
  const { baseDate, targetDate } = route.params;
  const base = useMemo(() => new Date(baseDate + "T12:00:00"), [baseDate]);
  const target = useMemo(
    () => new Date(targetDate + "T12:00:00"),
    [targetDate]
  );
  const totalBlocks = useMemo(
    () => getDaysBetween(base, target),
    [base, target]
  );
  const today = useMemo(() => new Date(), []);
  const todayTime = today.getTime();
  const elapsedDays = useMemo(() => {
    if (todayTime < base.getTime()) return 0;
    if (todayTime > target.getTime()) return totalBlocks;
    return getDaysBetween(base, today);
  }, [base, target, todayTime, totalBlocks]);
  const progress =
    totalBlocks > 0 ? Math.round((elapsedDays / totalBlocks) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topSection}>
        <Text style={styles.date}>
          {formatDate(baseDate)} ~ {formatDate(targetDate)}
        </Text>
        <View style={styles.progressWrap}>
          <Text style={styles.progress}>{progress}% 완료</Text>
        </View>
      </View>
      <View style={styles.gridWrap}>
        <RangeGrassGrid totalDays={totalBlocks} elapsedDays={elapsedDays} />
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
  topSection: {
    marginBottom: 0,
  },
  date: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  progressWrap: {
    marginBottom: 16,
  },
  progress: {
    fontSize: 16,
    color: theme.text,
  },
  gridWrap: {
    width: "100%",
    alignItems: "center",
  },
});
