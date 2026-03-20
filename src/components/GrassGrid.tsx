import React from "react";
import { StyleSheet, View } from "react-native";
import { DayCell } from "./DayCell";
import type { CellState } from "./DayCell";
import { CELL_GAP } from "../constants/gridConstants";

interface GrassGridProps {
  rows: CellState[][];
  cellSize: number;
}

export const GrassGrid = React.memo(function GrassGrid({ rows, cellSize }: GrassGridProps) {
  const cellSizeStyle = { width: cellSize, height: cellSize };

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((state, colIndex) => (
            <View
              key={colIndex}
              style={[
                styles.cellWrapper,
                cellSizeStyle,
                colIndex < row.length - 1 && styles.cellGap,
              ]}
            >
              <DayCell state={state} size={cellSize} />
            </View>
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
  },
  cellWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  cellGap: {
    marginRight: CELL_GAP,
  },
});
