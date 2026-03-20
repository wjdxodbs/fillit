import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTodayStr } from "../hooks/useTodayStr";
import { useTheme } from "../stores/themeStore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DatesStackParamList } from "../navigation/DatesStackScreen";
import { RangeGrassGrid } from "../components/RangeGrassGrid";
import { StatsCard } from "../components/StatsCard";
import { ScreenSeparator } from "../components/ScreenSeparator";
import { type Theme } from "../theme";
import { formatDateRange } from "../utils/dateUtils";
import { useGoalProgress } from "../hooks/useGoalProgress";

type Props = NativeStackScreenProps<DatesStackParamList, "DateDetail">;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
  const todayStr = useTodayStr();
  const { totalDays, elapsedDays, isCompleted, progressPercent } = useGoalProgress(baseDate, targetDate, todayStr);
  const remainingDays = totalDays - elapsedDays;

  return (
    <View style={styles.container}>
      <ScreenSeparator />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StatsCard
          progress={progressPercent}
          elapsed={elapsedDays}
          remaining={remainingDays}
          subtitle={formatDateRange(baseDate, targetDate)}
        />
        <View style={styles.gridWrap}>
          <RangeGrassGrid
            totalDays={totalDays}
            elapsedDays={elapsedDays}
            isCompleted={isCompleted}
          />
        </View>
      </ScrollView>
    </View>
  );
}
