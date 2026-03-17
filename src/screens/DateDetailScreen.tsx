import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RangeGrassGrid } from "../components/RangeGrassGrid";
import { theme } from "../theme";
import { getDaysBetween, formatDate, toDateStr } from "../utils/dateUtils";

type DateDetailScreenProps = {
  route: { params: { title: string; baseDate: string; targetDate: string } };
};

export function DateDetailScreen({ route }: DateDetailScreenProps) {
  const { baseDate, targetDate } = route.params;
  const totalBlocks = useMemo(
    () => getDaysBetween(baseDate, targetDate),
    [baseDate, targetDate]
  );
  const todayStr = toDateStr(new Date());
  const elapsedDays = useMemo(() => {
    if (todayStr < baseDate) return 0;
    if (todayStr > targetDate) return totalBlocks;
    return getDaysBetween(baseDate, todayStr);
  }, [baseDate, targetDate, todayStr, totalBlocks]);
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
