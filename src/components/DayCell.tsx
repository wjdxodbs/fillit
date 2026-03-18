import React from "react";
import { View } from "react-native";
import { theme } from "../theme";

export type CellState = "empty" | "filled" | "today" | "highlight";

interface DayCellProps {
  state: CellState;
  size?: number;
}

const CELL_COLORS: Record<CellState, string> = {
  empty: theme.grassEmpty,
  filled: theme.grassFilled,
  today: theme.grassTodayCell,
  highlight: theme.grassHighlight,
};

export const DayCell = React.memo(function DayCell({ state, size = 10 }: DayCellProps) {
  const backgroundColor = CELL_COLORS[state];

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
});
