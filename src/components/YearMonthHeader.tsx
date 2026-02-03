import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

interface YearMonthHeaderProps {
  year: number;
  month: number;
}

export function YearMonthHeader({ year, month }: YearMonthHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {year}년 {month + 1}월
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  text: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.text,
  },
});
