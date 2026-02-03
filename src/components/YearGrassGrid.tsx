import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { DayCell } from "./DayCell";

const CELL_GAP = 6;
const COLUMNS = 16;
/** 홈/상세 화면 좌우 패딩 합계(content 20*2) → 잔디 크기 계산 */
const GRID_HORIZONTAL_PADDING = 40;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface YearGrassGridProps {
  year: number;
  endDate: Date | string;
  startDate?: Date | string;
  cellSize?: number;
  highlightEndDate?: boolean;
}

export function YearGrassGrid({
  year,
  endDate,
  startDate: startDateProp,
  cellSize: cellSizeProp,
  highlightEndDate = true,
}: YearGrassGridProps) {
  const { width } = useWindowDimensions();
  const cellSize = useMemo(() => {
    if (cellSizeProp != null) return cellSizeProp;
    const available = width - GRID_HORIZONTAL_PADDING;
    const size = Math.floor((available - (COLUMNS - 1) * CELL_GAP) / COLUMNS);
    return Math.max(1, size);
  }, [width, cellSizeProp]);

  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const start = startDateProp
    ? typeof startDateProp === "string"
      ? new Date(startDateProp)
      : startDateProp
    : null;
  const endDayOfYear = end.getFullYear() === year ? getDayOfYear(end) : 0;
  const startDayOfYear =
    start && start.getFullYear() === year ? getDayOfYear(start) : 1;

  const { rows } = useMemo(() => {
    const daysInYear = isLeapYear(year) ? 366 : 365;
    const days: number[] = [];
    for (let d = 1; d <= daysInYear; d++) days.push(d);
    const rows: number[][] = [];
    for (let i = 0; i < days.length; i += COLUMNS) {
      rows.push(days.slice(i, i + COLUMNS));
    }
    return { rows };
  }, [year]);

  const today = useMemo(() => new Date(), []);

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { marginBottom: CELL_GAP }]}>
          {row.map((dayOfYear, colIndex) => {
            const filled =
              dayOfYear >= startDayOfYear && dayOfYear <= endDayOfYear;
            const isEndDay = dayOfYear === endDayOfYear;
            const cellDate = new Date(year, 0, dayOfYear);
            const isToday = isSameDay(cellDate, today);

            let state: "empty" | "filled" | "today" | "highlight" = filled
              ? "filled"
              : "empty";
            if (filled && highlightEndDate && isToday) {
              state = "today";
            } else if (filled && highlightEndDate && isEndDay) {
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
  container: {},
  row: {
    flexDirection: "row",
  },
  cellWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
