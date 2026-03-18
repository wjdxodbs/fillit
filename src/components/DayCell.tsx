import React from "react";
import { View } from "react-native";
import { useTheme } from "../stores/themeStore";

export type CellState = "empty" | "filled" | "today" | "highlight";

interface DayCellProps {
  state: CellState;
  size?: number;
}

export function DayCell({ state, size = 10 }: DayCellProps) {
  const { theme } = useTheme();
  const backgroundColor =
    state === "empty"
      ? theme.grassEmpty
      : state === "filled"
      ? theme.grassFilled
      : state === "today"
      ? theme.grassTodayCell
      : theme.grassHighlight;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        backgroundColor,
      }}
    />
  );
}
