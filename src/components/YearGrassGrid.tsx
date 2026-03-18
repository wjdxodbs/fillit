import React, { useMemo } from "react";
import { isLeapYear, getDayOfYear } from "../utils/dateUtils";
import { COLUMNS } from "./gridConstants";
import { useCellSize } from "../hooks/useCellSize";
import { GrassGrid } from "./GrassGrid";
import type { CellState } from "./DayCell";

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
  const endDayOfYear =
    endDate.getFullYear() === year ? getDayOfYear(endDate) : 0;

  const rows = useMemo(() => {
    const daysInYear = isLeapYear(year) ? 366 : 365;
    const cells: CellState[] = [];
    for (let d = 1; d <= daysInYear; d++) {
      const filled = d <= endDayOfYear;
      const isEndDay = d === endDayOfYear;
      const isToday = isSameDay(new Date(year, 0, d), endDate);
      let state: CellState = filled ? "filled" : "empty";
      if (filled && isToday) state = "today";
      else if (filled && isEndDay) state = "highlight";
      cells.push(state);
    }
    const rows: CellState[][] = [];
    for (let i = 0; i < cells.length; i += COLUMNS) {
      rows.push(cells.slice(i, i + COLUMNS));
    }
    return rows;
  }, [year, endDate, endDayOfYear]);

  return <GrassGrid rows={rows} cellSize={cellSize} />;
}
