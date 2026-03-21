import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../stores/themeStore";
import { type Theme } from "../../theme";

interface YearMonthHeaderProps {
  year: number;
  month: number;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    text: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.text,
    },
  });

export function YearMonthHeader({ year, month }: YearMonthHeaderProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View>
      <Text style={styles.text}>
        {year}년 {month + 1}월
      </Text>
    </View>
  );
}
