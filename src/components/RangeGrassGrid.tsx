import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { DayCell } from "./DayCell";

const CELL_GAP = 6;
const COLUMNS = 16;
const GRID_HORIZONTAL_PADDING = 40;

interface RangeGrassGridProps {
  totalDays: number;
  elapsedDays: number;
  cellSize?: number;
}

export function RangeGrassGrid({
  totalDays,
  elapsedDays,
  cellSize: cellSizeProp,
}: RangeGrassGridProps) {
  const { width } = useWindowDimensions();
  const cellSize = useMemo(() => {
    if (cellSizeProp != null) return cellSizeProp;
    const available = width - GRID_HORIZONTAL_PADDING;
    const size = Math.floor((available - (COLUMNS - 1) * CELL_GAP) / COLUMNS);
    return Math.max(1, size);
  }, [width, cellSizeProp]);

  const rows = useMemo(() => {
    const cells: number[] = [];
    for (let i = 0; i < totalDays; i++) cells.push(i);
    const rows: number[][] = [];
    for (let i = 0; i < cells.length; i += COLUMNS) {
      rows.push(cells.slice(i, i + COLUMNS));
    }
    return rows;
  }, [totalDays]);

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { marginBottom: CELL_GAP }]}>
          {row.map((cellIndex, colIndex) => {
            const filled = cellIndex < elapsedDays;
            const isLastCell = cellIndex === totalDays - 1;
            const isTodayCell =
              cellIndex === elapsedDays - 1 &&
              elapsedDays > 0 &&
              elapsedDays < totalDays;

            let state: "empty" | "filled" | "today" | "highlight" = filled
              ? "filled"
              : "empty";
            if (filled && isLastCell) {
              state = "highlight";
            } else if (filled && isTodayCell) {
              state = "today";
            }

            return (
              <View
                key={cellIndex}
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
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: "row",
  },
  cellWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
