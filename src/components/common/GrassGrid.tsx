import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { DayCell } from "./DayCell";
import type { CellState } from "./DayCell";
import { CELL_GAP } from "../../constants/gridConstants";
import { useTheme } from "../../stores/themeStore";

interface GrassGridProps {
  rows: CellState[][];
  cellSize: number;
}

export const GrassGrid = React.memo(function GrassGrid({ rows, cellSize }: GrassGridProps) {
  const { theme } = useTheme();
  const cellStyles = useMemo(() => {
    const base = { width: cellSize, height: cellSize, borderRadius: cellSize * 0.25 };
    return {
      empty:     { ...base, backgroundColor: theme.grassEmpty },
      filled:    { ...base, backgroundColor: theme.grassFilled },
      today:     { ...base, backgroundColor: theme.grassTodayCell },
      highlight: { ...base, backgroundColor: theme.grassHighlight },
    };
  }, [cellSize, theme]);

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((state, colIndex) => (
            <DayCell key={colIndex} style={cellStyles[state]} />
          ))}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: CELL_GAP,
    gap: CELL_GAP,
  },
});
