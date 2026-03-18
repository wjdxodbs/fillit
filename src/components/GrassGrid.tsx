import React from "react";
import { StyleSheet, View } from "react-native";
import { DayCell } from "./DayCell";
import type { CellState } from "./DayCell";
import { CELL_GAP } from "./gridConstants";

interface GrassGridProps {
  rows: CellState[][];
  cellSize: number;
}

export function GrassGrid({ rows, cellSize }: GrassGridProps) {
  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { marginBottom: CELL_GAP }]}>
          {row.map((state, colIndex) => (
            <View
              key={colIndex}
              style={[
                styles.cellWrapper,
                {
                  width: cellSize,
                  height: cellSize,
                  marginRight: colIndex < row.length - 1 ? CELL_GAP : 0,
                },
              ]}
            >
              <DayCell state={state} size={cellSize} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  cellWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
