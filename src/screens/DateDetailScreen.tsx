import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DatesStackParamList } from "../navigation/DatesStackScreen";
import { RangeGrassGrid } from "../components/RangeGrassGrid";
import { StatsCard } from "../components/StatsCard";
import { theme } from "../theme";
import {
  getDaysBetween,
  getElapsedDays,
  formatDate,
  toDateStr,
} from "../utils/dateUtils";

type Props = NativeStackScreenProps<DatesStackParamList, "DateDetail">;

export function DateDetailScreen({ route }: Props) {
  const { baseDate, targetDate } = route.params;
  const totalBlocks = useMemo(
    () => getDaysBetween(baseDate, targetDate),
    [baseDate, targetDate],
  );
  const [todayStr, setTodayStr] = useState(() => toDateStr(new Date()));
  useFocusEffect(
    useCallback(() => {
      setTodayStr(toDateStr(new Date()));
    }, []),
  );
  const isCompleted = todayStr > targetDate;
  const elapsedDays = useMemo(
    () => getElapsedDays(baseDate, targetDate, totalBlocks, todayStr),
    [baseDate, targetDate, totalBlocks, todayStr],
  );
  const progress =
    totalBlocks > 0 ? Math.round((elapsedDays / totalBlocks) * 100) : 0;
  const remainingDays = totalBlocks - elapsedDays;

  return (
    <View style={styles.container}>
      <View style={styles.separator} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StatsCard
          progress={progress}
          elapsed={elapsedDays}
          remaining={remainingDays}
          subtitle={`${formatDate(baseDate)} ~ ${formatDate(targetDate)}`}
        />
        <View style={styles.gridWrap}>
          <RangeGrassGrid
            totalDays={totalBlocks}
            elapsedDays={elapsedDays}
            isCompleted={isCompleted}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  separator: {
    height: 1,
    backgroundColor: theme.border,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  gridWrap: {
    width: "100%",
    alignItems: "flex-start",
  },
});
