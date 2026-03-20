import React, { useMemo } from "react";
import { isLeapYear, getDayOfYear, isSameDay, chunkArray } from "../utils/dateUtils";
import { COLUMNS, resolveCellState } from "../constants/gridConstants";
import type { CellState } from "./DayCell";
import { useCellSize } from "../hooks/useCellSize";
import { GrassGrid } from "./GrassGrid";


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
      cells.push(resolveCellState(filled, isToday, isEndDay));
    }
    return chunkArray(cells, COLUMNS);
  }, [year, endDate]);

  return <GrassGrid rows={rows} cellSize={cellSize} />;
}
