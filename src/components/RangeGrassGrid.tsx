import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { DayCell } from "./DayCell";
import { COLUMNS, CELL_GAP } from "./gridConstants";
import { useCellSize } from "../hooks/useCellSize";

interface RangeGrassGridProps {
  totalDays: number;
  elapsedDays: number;
  /** 오늘이 targetDate를 지난 경우 true. 마지막 셀을 highlight(목표 완료)로 표시 */
  isCompleted?: boolean;
  cellSize?: number;
}

export function RangeGrassGrid({
  totalDays,
  elapsedDays,
  isCompleted = false,
  cellSize: cellSizeProp,
}: RangeGrassGridProps) {
  const cellSize = useCellSize(cellSizeProp);

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
    <View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { marginBottom: CELL_GAP }]}>
          {row.map((cellIndex, colIndex) => {
            const filled = cellIndex < elapsedDays;
            const isLastCell = cellIndex === totalDays - 1;
            // 오늘 셀: 경과 마지막 칸이면서 목표 기간이 끝나지 않은 경우
            // isCompleted=true(오늘 > targetDate)면 today 제외, highlight만 표시
            const isTodayCell =
              cellIndex === elapsedDays - 1 &&
              elapsedDays > 0 &&
              !isCompleted;

            let state: "empty" | "filled" | "today" | "highlight" = filled
              ? "filled"
              : "empty";
            if (filled && isTodayCell) {
              state = "today";
            } else if (filled && isLastCell && isCompleted) {
              state = "highlight";
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
  row: {
    flexDirection: "row",
  },
  cellWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
