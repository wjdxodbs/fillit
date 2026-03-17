import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { DayCell } from "./DayCell";
import { isLeapYear, getDayOfYear } from "../utils/dateUtils";
import { COLUMNS, CELL_GAP } from "./gridConstants";
import { useCellSize } from "../hooks/useCellSize";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface YearGrassGridProps {
  year: number;
  endDate: Date;
  cellSize?: number;
}

export function YearGrassGrid({
  year,
  endDate,
  cellSize: cellSizeProp,
}: YearGrassGridProps) {
  const cellSize = useCellSize(cellSizeProp);

  const endDayOfYear = endDate.getFullYear() === year ? getDayOfYear(endDate) : 0;

  const rows = useMemo(() => {
    const daysInYear = isLeapYear(year) ? 366 : 365;
    const days: number[] = [];
    for (let d = 1; d <= daysInYear; d++) days.push(d);
    const rows: number[][] = [];
    for (let i = 0; i < days.length; i += COLUMNS) {
      rows.push(days.slice(i, i + COLUMNS));
    }
    return rows;
  }, [year]);

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { marginBottom: CELL_GAP }]}>
          {row.map((dayOfYear, colIndex) => {
            const filled = dayOfYear <= endDayOfYear;
            const isEndDay = dayOfYear === endDayOfYear;
            const cellDate = new Date(year, 0, dayOfYear);
            const isToday = isSameDay(cellDate, endDate);

            let state: "empty" | "filled" | "today" | "highlight" = filled
              ? "filled"
              : "empty";
            if (filled && isToday) {
              state = "today";
            } else if (filled && isEndDay) {
              state = "highlight";
            }

            return (
              <View
                key={`${rowIndex}-${colIndex}`}
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
