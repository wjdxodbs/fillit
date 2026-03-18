import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTodayStr } from "../hooks/useTodayStr";
import { useTheme } from "../stores/themeStore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DatesStackParamList } from "../navigation/DatesStackScreen";
import { RangeGrassGrid } from "../components/RangeGrassGrid";
import { StatsCard } from "../components/StatsCard";
import { type Theme } from "../theme";
import {
  getDaysBetween,
  getElapsedDays,
  formatDate,
  calcProgress,
} from "../utils/dateUtils";

type Props = NativeStackScreenProps<DatesStackParamList, "DateDetail">;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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

export function DateDetailScreen({ route }: Props) {
  const { baseDate, targetDate } = route.params;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const totalBlocks = getDaysBetween(baseDate, targetDate);
  const todayStr = useTodayStr();
  const isCompleted = todayStr > targetDate;
  const elapsedDays = getElapsedDays(baseDate, targetDate, totalBlocks, todayStr);
  const progress = calcProgress(elapsedDays, totalBlocks);
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
